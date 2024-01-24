import { Client } from "discord.js";
import { Command} from "../Command";
import {channelConnection, waitList} from "./play";

export const Stop: Command = {
    name: "stop",
    description: "Disconnects the bot from the channel",
    type: 1,
    run: async (client: Client, interaction) => {
        if (channelConnection) {
            channelConnection.disconnect();
            waitList.length = 0;
            interaction.followUp("Bot disconnected");
        } else {
            interaction.followUp("Not in a channel");
        }
    }
};
