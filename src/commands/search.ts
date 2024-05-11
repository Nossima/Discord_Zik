import {
    Client,
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu, MessageSelectOptionData,
    ReactionManager
} from "discord.js";
import { Command } from "../Command";
import { youtubeApi } from "../Bot";
import { EmbedBuilder } from "@discordjs/builders";
import { youtube_v3 } from "googleapis";
import getAllPlaylists from "../data/transactions/playlists/getAll";
import { Maybe, None, Some } from "monet";

type SearchListResponse = youtube_v3.Schema$SearchListResponse;
type SearchResult = youtube_v3.Schema$SearchResult;
type ChannelResult = youtube_v3.Schema$ChannelListResponse;

const resultList: SearchResult[] = [];
const resultPage: number = 0;

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
        youtubeApi.searchAll(interaction.options.get("keyword")?.value as string, 10, { type: 'video' })
            .then(async (response: SearchListResponse) => {
                resultList.push(...response.items || []);
                if (resultList && resultList.length > 0) {
                    const res = resultList[resultPage];
                    const embedMessage = await setEmbedMessage(res);
                    const selectOptions = await getPlaylistOptions();
                    const select = setSelect(selectOptions);

                    sendResultMessage(interaction, embedMessage, select, resultPage === 0);
                }
            });
    }
};

const collectorFilter = (reaction: any, user: any) => {
    console.log(reaction)
    return reaction.emoji.name === '⬅' || reaction.emoji.name === '▶' || reaction.emoji.name === '➡'
};
const sendResultMessage = (interaction: CommandInteraction, embedMessage: any, maybeSelect: Maybe<MessageActionRow>, isFirst: boolean) => {
    const options = maybeSelect.cata(
        () => ({ embeds: [embedMessage] }),
        (select) => ({ embeds: [embedMessage], components: [select] })
    );
    interaction.channel!.send(options)
        .then((message) => {
            const reactionManager: ReactionManager = message.reactions as ReactionManager;
                reactionManager.message.react(isFirst ? '▶' : '⬅')
                    .then(() => reactionManager.message.react(isFirst ? '➡' : '▶'))
                    .then(() => { isFirst && reactionManager.message.react('➡') })
                    .then(() => {
                        console.log("collector")
                        const collector = reactionManager.message.createReactionCollector({ filter: collectorFilter, time: 15_000 });
                        collector.on('collect', (reaction) => console.log(reaction))
                        collector.on('end', (collected) => console.log(reactionManager.message.reactions))
                    });
        })
}

const setEmbedMessage = async (searchResult: SearchResult) => {
    const embedMessage = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(searchResult.snippet?.title || "")
        .setImage(searchResult.snippet?.thumbnails?.default?.url || "")
        .addFields([
            {name: "Commands", value: ":arrow_left: Previous \u200B :arrow_forward: Play \u200B :arrow_right: Next"},
        ])
        .toJSON();
    if (searchResult.id?.videoId) {
        embedMessage.url = `https://www.youtube.com/watch?v=${searchResult.id.videoId}`;
    }
    if (searchResult.snippet?.channelId) {
        const channelResult: ChannelResult = await youtubeApi.searchChannel(searchResult.snippet?.channelId);
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

const setSelect = (options: MessageSelectOptionData[]): Maybe<MessageActionRow> =>
    options.length > 0 ? Some(new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId("select_search_to_playlist")
                .setPlaceholder("Add to playlist...")
                .addOptions(options)
        )) : None();

const getPlaylistOptions = (): Promise<MessageSelectOptionData[]> =>
    getAllPlaylists()
        .then((errorsOrPlaylists) => errorsOrPlaylists.cata(
            () => [],
            (playlists) => playlists
                .map((playlist) => (
                    {
                        label: playlist.name,
                        value: playlist.name
                    })
                )
            )
        );