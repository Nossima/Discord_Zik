import { Client } from "discord.js";
import { Commands } from "../Commands";
import { youtubeApi } from "../Bot";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(Commands);

        if (youtubeApi) {
            console.log(`[${new Date().toLocaleString()}]\n${client.user.username} bot is online !`);
        } else {
            console.error("Youtube api couldn't be initialized.")
        }
    });
};