import {
    ActionRowBuilder,
    Client,
    CommandInteraction,
    Message,
    MessageReaction,
    PartialMessage, ReactionCollector,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, User
} from "discord.js";
import { Command } from "../Command";
import {client, youtubeApi} from "../Bot";
import { EmbedBuilder } from "@discordjs/builders";
import { youtube_v3 } from "googleapis";
import getAllPlaylists from "../data/transactions/playlists/getAll";
import { Maybe, None, Some } from "monet";
import { Emoji } from "../data/types/global";
import { playFromSearch } from "./playUrl";
import { Music } from "../data/types/music";

type SearchListResponse = youtube_v3.Schema$SearchListResponse;
type SearchResult = youtube_v3.Schema$SearchResult;
type ChannelResult = youtube_v3.Schema$ChannelListResponse;
interface SearchRes extends SearchResult {
    channel?: string;
}

interface SearchState {
    message?: Message,
    resultList: SearchResult[],
    resultPage: number
}
export const searchState: SearchState = {
    resultList: [] as SearchResult[],
    resultPage: 0
}

export const SearchVideo: Command = {
    name: "search",
    description: "Search a music",
    type: 1,
    options: [
        {
            name: "keyword",
            description: "keyword to search a music",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction) => {
        resetSearch();
        youtubeApi.searchAll(interaction.options.get("keyword")?.value as string, 10, { type: 'video' })
            .then(async (response: SearchListResponse) => {
                searchState.resultList.push(...response.items || []);
                if (searchState.resultList && searchState.resultList.length > 0) {
                    const res = searchState.resultList[searchState.resultPage];
                    const embedMessage = await setEmbedMessage(res);
                    const selectOptions = await getPlaylistOptions();
                    const select = setSelect(selectOptions);

                    sendResultMessage(interaction, embedMessage, select);
                }
            });
    }
};

const collectorFilter = (reaction: any, user: any) =>
    ['⬅', '▶', '➡'].includes(reaction.emoji.name) && !user.bot;
const sendResultMessage = (interaction: CommandInteraction, embedMessage: any, maybeSelect: Maybe<StringSelectMenuBuilder>) => {
    const options = maybeSelect.cata(
        () => ({ embeds: [embedMessage] }),
        (select) => {
            const row = new ActionRowBuilder().addComponents(select);
            return({
                embeds: [embedMessage],
                components: [row]
            })
        }
    );
    interaction.channel!.send(options)
        .then(putReactionsAndHandler);
}
const editMessage = (message: Message<boolean> | PartialMessage, embedMessage: any, maybeSelect: Maybe<StringSelectMenuBuilder>) => {
    const options = maybeSelect.cata(
        () => ({ embeds: [embedMessage] }),
        (select) => {
            const row = new ActionRowBuilder().addComponents(select);
            return({
                embeds: [embedMessage],
                components: [row]
            })
        }
    );
    message.edit(options)
        .then(() => putReactionsAndHandler(message as Message));
}
const putReactionsAndHandler = (message: Message) => {
    message.react('⬅')
        .then(() => message.react('▶'))
        .then(() => message.react('➡'))
        .then(() => {
            searchState.message = message;
            const collector = message.createReactionCollector({ filter: collectorFilter, time: 15_000 });
            collector.on('collect', (reaction, user) => {
                handleReaction(collector, reaction, user);
            });
            collector.on('end', () => {
                resetSearch();
            });
        });
}

const setEmbedMessage = async (searchResult: SearchResult) => {
    const embedMessage = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(searchResult.snippet?.title || "")
        .setImage(searchResult.snippet?.thumbnails?.default?.url || "")
        .addFields([
            {name: "Commands", value: ":arrow_left: Previous \u200B :arrow_forward: Play \u200B :arrow_right: Next"},
        ])
        .setFooter({
            text: `${searchState.resultPage + 1} / ${searchState.resultList.length}`
        })
        .toJSON();
    if (searchResult.id?.videoId) {
        embedMessage.url = `https://www.youtube.com/watch?v=${searchResult.id.videoId}`;
    }
    if (searchResult.snippet?.channelId) {
        const channelResult: ChannelResult = await youtubeApi.searchChannel(searchResult.snippet!.channelTitle!);
        if (channelResult.items && channelResult.items?.length > 0) {
            const channel = channelResult.items[0];
            embedMessage.author = {
                name: channel.snippet?.title || ''
            }
            if (channel.snippet?.thumbnails?.default?.url)
                embedMessage.author.icon_url = channel.snippet?.thumbnails?.default?.url;
        }
    }
    return embedMessage;
}

const setSelect = (options: StringSelectMenuOptionBuilder[]): Maybe<StringSelectMenuBuilder> =>
    options.length > 0 ? Some(new StringSelectMenuBuilder()
                .setCustomId("select_search_to_playlist")
                .setPlaceholder("Add to playlist...")
                .addOptions(options)
        ) : None();

const getPlaylistOptions = (): Promise<StringSelectMenuOptionBuilder[]> =>
    getAllPlaylists()
        .then((errorsOrPlaylists) => errorsOrPlaylists.cata(
            () => [],
            (playlists) => playlists
                .map((playlist) => new StringSelectMenuOptionBuilder()
                    .setLabel(playlist.name)
                    .setValue(playlist.name)
                )
            )
        );

const handleReaction = async (collector: ReactionCollector, reaction: MessageReaction, user: User) => {
    switch (reaction.emoji.name) {
        case Emoji.LeftArrow:
            if (searchState.resultPage > 0) {
                searchState.resultPage--;
                const res = searchState.resultList[searchState.resultPage];
                const embedMessage = await setEmbedMessage(res);
                const selectOptions = await getPlaylistOptions();
                const select = setSelect(selectOptions);
                collector.stop();
                editMessage(reaction.message, embedMessage, select);
            }
            break;
        case Emoji.Play:
            const video = searchState.resultList[searchState.resultPage];
            const guild = client.guilds.cache.get(reaction!.message!.guild!.id);
            const guildUser = guild ? guild.members.cache.get(user.id) : undefined;
            if (video.id?.videoId && guildUser) {
                const channel = guildUser.voice.channel;
                const music: Music = {
                    name: "Url",
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`
                }
                if (channel) {
                    collector.stop();
                    playFromSearch(channel, reaction.message as Message, music);
                }
            }
            break;
        case Emoji.RightArrow:
            if (searchState.resultPage < searchState.resultList.length - 1) {
                searchState.resultPage++;
                const res = searchState.resultList[searchState.resultPage];
                const embedMessage = await setEmbedMessage(res);
                const selectOptions = await getPlaylistOptions();
                const select = setSelect(selectOptions);
                collector.stop();
                editMessage(reaction.message, embedMessage, select);
            }
            break;
    }
}

const resetSearch = () => {
    searchState.resultList = [];
    searchState.resultPage = 0;
    if (searchState.message)
        searchState.message.reactions.removeAll();
}