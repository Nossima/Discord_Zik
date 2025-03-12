import { Client } from "discord.js";
import { Command } from "../Command";
import { waitList } from "./playUrl";
import { EmbedBuilder } from "@discordjs/builders";
import { APIEmbedField } from "discord-api-types/v10";

export const WaitList: Command = {
    name: "waitlist",
    description: "Show waitlist",
    type: 1,
    run: async (client: Client, interaction) => {
        if (waitList.length === 0) {
            interaction.followUp("Nothing in the waitlist");
        } else {
            const embedMessage = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("WaitList")
                .addFields(waitListToFields())
                .toJSON();
            interaction.followUp({ embeds: [embedMessage] });
        }
    }
};

const waitListToFields = () : APIEmbedField[] => waitList.map((music, i) => ({
    name: `${i} - ${music.author ? music.author : 'Youtube'}`,
    value: `${i} - ${music.name !== "Url" ? music.name : music.url}`
}))
