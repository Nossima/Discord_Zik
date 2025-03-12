import { Command } from "../Command";
import { Client} from "discord.js/typings";
import { CommandInteraction } from "discord.js";

export const SetAvatar: Command = {
    name: "avatar",
    description: "Set the bot avatar",
    type: 1,
    options: [
        {
            name: "avatar",
            description: "the new avatar",
            type: 11,
            required: true
        }
    ],
    run: async (client: Client, interaction) => {
        const avatar = interaction.options.get("avatar")?.attachment;
        let isError: boolean = false;

        if (!client.user || !avatar || avatar.contentType !== "image/gif")
            return await sendMessage(interaction, "Please use a valid image or gif")

        client.user.setAvatar(avatar.url)
            .catch(async (err) => {
                isError = true;
                return await sendMessage(interaction, `Error: ${err}`)
            })
        if (isError) return;
        await sendMessage(interaction, "Avatar updated");
    }
};

const sendMessage = async (interaction: CommandInteraction, message: string) => {
    if (!interaction.deferred && !interaction.replied)
        await interaction.reply(message);
    else
        await interaction.editReply(message);
}
