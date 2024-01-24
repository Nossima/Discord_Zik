import { Client, GuildMember, VoiceBasedChannel } from "discord.js";
import { Command} from "../Command";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel, VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import { createDiscordJSAdapter } from "../../dist/adapter";
import {playNext} from "./next";

const ytdl = require("ytdl-core");

export let channelConnection: VoiceConnection;

export const discordPlayer = createAudioPlayer();
export let waitList: string[] = [];

export const Play: Command = {
    name: "play",
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

        if (channel) {
            joinChannel(channel)
                .then((connection) =>
            {
                channelConnection = connection;
                connection.subscribe(discordPlayer);
                const state = playMusic(interaction.options.get("url")?.value as string);
                interaction.followUp(state === "play" ? "Music is playing" : "Music added to wait list");
            });

        }
    }
};

const joinChannel = async (channel: VoiceBasedChannel) => {

    const connection = joinVoiceChannel({
        channelId: channel?.id || "",
        guildId: channel?.guildId || "",
        adapterCreator: createDiscordJSAdapter(channel)
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

export const playMusic = (url: string, force: boolean = false): "play" | "wait" => {
    const status = discordPlayer.state.status;
    if (status == AudioPlayerStatus.Playing && !force) {
        waitList.push(url);
        return "wait";
    }
    const stream = ytdl(url, {
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