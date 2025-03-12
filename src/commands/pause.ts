import { Client } from "discord.js";
import { Command } from "../Command";
import { AudioPlayerStatus } from "@discordjs/voice";
import { discordPlayer } from "./playUrl";

export const Pause: Command = {
    name: "pause",
    description: "Pause the music",
    type: 1,
    run: async (client: Client, interaction) => {
        const status = discordPlayer.state.status;
        if (status === AudioPlayerStatus.Playing) {
            discordPlayer.pause();
            interaction.followUp("Music is paused");
        } else if (status === AudioPlayerStatus.Paused) {
            discordPlayer.unpause();
            interaction.followUp("Music is resumed");
        } else
            interaction.followUp("No music playing");
    }
};
