import { Client } from "discord.js";
import { Command } from "../Command";
import {removePlaylist} from "../data/transactions/playlists/delete";

export const PlaylistDelete: Command = {
    name: "deleteplaylist",
    description: "Delete playlist",
    type: 1,
    options: [
        {
            name: "name",
            description: "name of the playlist",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction) => {
        const name = interaction.options.get("name")?.value as string;

        removePlaylist(name)
            .then((maybeInsertErrors) => maybeInsertErrors.cata(
                () => interaction.followUp("Playlist deleted"),
                (errors) => interaction.followUp(`An error occurred: ${errors[0].message}`)
            ));
    }
};
