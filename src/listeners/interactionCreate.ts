import { CommandInteraction, Client, SelectMenuInteraction } from "discord.js";
import { Commands  } from "../Commands";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isCommand() || interaction.isCommand()) {
            await handleSlashCommand(client, interaction);
        } else if (interaction.isSelectMenu()) {
            await handleSelectMenu(client, interaction);
        }
    });
    client.on("messageReactionAdd", async (reaction) => {
        console.log(reaction);
    })
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp({ content: "An error has occurred" });
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};

const handleSelectMenu = async (client: Client, interaction: SelectMenuInteraction): Promise<void> => {
    console.log(interaction);
};