import { CommandInteraction, Client, SelectMenuInteraction } from "discord.js";
import { Commands } from "../Commands";
import {isNull, isUndefined} from "genius-lyrics/dist/helpers/types";
import {playlistAddUrl} from "../commands/playlistAddUrl";
import {searchState} from "../commands/search";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isCommand() || interaction.isCommand()) {
            await handleSlashCommand(client, interaction);
        } else if (interaction.isStringSelectMenu()) {
            await handleSelectMenu(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (isUndefined(slashCommand)) {
        interaction.followUp({ content: "An error has occurred" });
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};

const handleSelectMenu = async (client: Client, interaction: SelectMenuInteraction): Promise<void> => {
    const result = searchState.resultList[searchState.resultPage];
    const url = `https://www.youtube.com/watch?v=${result.id!.videoId}`;
    const name = result.snippet!.title!;
    const author = result.snippet!.channelTitle!;
    await interaction.deferReply();

    playlistAddUrl(interaction, interaction.user, interaction.values[0], url, name, author)
};
