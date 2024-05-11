import { Client } from "discord.js";
import { Command } from "../Command";
import getPlaylistByName from "../data/transactions/playlists/getByName";
import { insertPlaylist } from "../data/transactions/playlists/create";
import { Either, Maybe, None, Some } from "monet";
import { error, Error } from "../data/types/error";
import { Playlist } from "../data/types/playlist";

export const MusicCreate: Command = {
    name: "createmusic",
    description: "Create music",
    type: 1,
    options: [
        {
            name: "url",
            description: "url of the youtube video",
            type: 3,
            required: true
        },
        {
            name: "name",
            description: "name of the music",
            type: 3,
            required: false
        }
    ],
    run: async (client: Client, interaction) => {
        const name = interaction.options.get("name")?.value as string;
        const user = interaction.user;

        getPlaylistByName(name)
            .then(checkIfPlaylistCanBeCreated)
            .then(createPlaylist(name, user.username))
            .then((maybeErrors) => maybeErrors.cata(
                () => {
                    interaction.followUp("Playlist created")
                },
                (errors) => {
                    console.log(errors)
                    interaction.followUp(`An error occurred: ${errors[0].message}`)
                }
            ));
    }
};

const checkIfPlaylistCanBeCreated = (
    errorsOrMaybePlaylist: Either<Error[], Maybe<Playlist>>
): Promise<Maybe<Error[]>> =>
    errorsOrMaybePlaylist.cata(
        (errors) => Promise.resolve(Some(errors)),
        (maybePlaylist) => maybePlaylist.cata(
            () => Promise.resolve(None()),
            () => Promise.resolve(Some([error('playlist', 'Playlist already exists')]))
        )
    )

const createPlaylist = (
    name: string, author: string
) => (maybeError: Maybe<Error[]>): Promise<Maybe<Error[]>> =>
        maybeError.cata(
            () => insertPlaylist({ name, author, collaborative: true })
                .then((maybeInsertErrors) => maybeInsertErrors.cata(
                    () => Promise.resolve(None<Error[]>()),
                    (insertErrors) => Promise.resolve(Some<Error[]>(insertErrors))
                )),
            (errors) => Promise.resolve(Some<Error[]>(errors))
        );
