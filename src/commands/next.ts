import { Client } from "discord.js";
import { Command } from "../Command";
import { playMusic, waitList } from "./play";

export const Next: Command = {
    name: "next",
    description: "Skip to next music",
    type: 1,
    run: async (client: Client, interaction) => {
        interaction.followUp(playNext() ? "Playing next music" : "Nothing in the wait list");
    }
};

export const playNext = (): boolean => {
    const nextMusic = waitList.shift();
    if (nextMusic) {
        playMusic(nextMusic, true);
        return true;
    } else {
        return false;
    }
}
