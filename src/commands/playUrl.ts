import {Client, GuildMember, Message, VoiceBasedChannel} from "discord.js";
import {Command} from "../Command";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import {playNext} from "./next";
import {Music} from "../data/types/music";

const ytdl = require("ytdl-core");

export let channelConnection: VoiceConnection;

export const discordPlayer = createAudioPlayer();
export let waitList: Music[] = [];

export const PlayUrl: Command = {
    name: "playurl",
    description: "Play a music",
    type: 1,
    options: [
        {
            name: "url",
            description: "url of the youtube video",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction) => {
        const channel = (interaction.member as GuildMember).voice.channel;
        const music: Music = {
            name: "Url",
            url: interaction.options.get("url")?.value as string
        }

        if ((!channelConnection || channelConnection.state.status === VoiceConnectionStatus.Disconnected) && channel) {
            joinChannel(channel)
                .then((connection) =>
                {
                    channelConnection = connection;
                    connection.subscribe(discordPlayer);
                    const state = playMusic(music);
                    interaction.followUp(state === "play" ? "Music is playing" : "Music added to wait list");
                });

        } else if (channelConnection) {
            const state = playMusic(music);
            interaction.followUp(state === "play" ? "Music is playing" : "Music added to wait list");
        }
    }
};

const joinChannel = async (channel: VoiceBasedChannel) => {
    const channelId = channel?.id;
    const guildId = channel?.guildId;
    const adapterCreator = channel?.guild.voiceAdapterCreator;

    try {
        const connection = joinVoiceChannel({
            channelId,
            guildId,
            adapterCreator,
            debug: true
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const playMusic = (music: Music, force: boolean = false): "play" | "wait" => {
    const status = discordPlayer.state.status;
    if (status === AudioPlayerStatus.Playing && !force) {
        waitList.push({
            name: music.name,
            url: music.url
        } as Music);
        return "wait";
    }
    const stream = ytdl(music.url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 30
    });
    stream.on("error", console.error);
    const resource = createAudioResource(stream);
    resource.volume?.setVolume(1);

    discordPlayer.play(resource);
    discordPlayer.addListener("stateChange", (oldOne, newOne) => {
        if (newOne.status == "idle") {
            playNext();
        }
    });
    return "play";
}

export const playFromSearch = (channel: VoiceBasedChannel, message: Message,  music: Music, force: boolean = false) => {
    if ((!channelConnection || channelConnection.state.status === VoiceConnectionStatus.Disconnected) && channel) {
        joinChannel(channel)
            .then((connection) =>
            {
                channelConnection = connection;
                connection.subscribe(discordPlayer);
                const state = playMusic(music);
                message.reply(state === "play" ? "Music is playing" : "Music added to wait list");
            });

    } else if (channelConnection) {
        const state = playMusic(music);
        message.reply(state === "play" ? "Music is playing" : "Music added to wait list");
    }
}