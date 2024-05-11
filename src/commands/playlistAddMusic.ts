import { Client } from "discord.js";
import { Command } from "../Command";
import getPlaylistByName from "../data/transactions/playlists/getByName";
import { insertPlaylist } from "../data/transactions/playlists/create";
import { Either, Maybe, None, Some } from "monet";
import { error, Error } from "../data/types/error";
import { Playlist } from "../data/types/playlist";

export const PlaylistAddYoutube: Command = {
    name: "addMusic",
    description: "Add a youtube music to a playlist",
    type: 1,
    options: [
        {
            name: "playlist",
            description: "name of the playlist",
            type: 3,
            required: true
        },{
            name: "url",
            description: "url of the youtube video",
            type: 3,
            required: true
        },{
            name: "name",
            description: "name for the music",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction) => {
        const playlist = interaction.options.get("playlist")?.value as string;
        const url = interaction.options.get("url")?.value as string;
        const name = interaction.options.get("name")?.value as string;
        const user = interaction.user;

        getPlaylistByName(name)
            .then(checkIfPlaylistCanBeEdited(user.username))
            .then(addMusicToPlaylist(name, user.username))
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

const checkIfPlaylistCanBeEdited = (
    username: string
) => (errorsOrMaybePlaylist: Either<Error[], Maybe<Playlist>>): Promise<Maybe<Error[]>> =>
    errorsOrMaybePlaylist.cata(
        (errors) => Promise.resolve(Some(errors)),
        (maybePlaylist) => maybePlaylist.cata(
            () => Promise.resolve(Some([error('playlist', "Playlist doesn't exists")])),
            (playlist) => Promise.resolve(
                playlist.collaborative || playlist.author === username ?
                    None() : Some([error('playlist', 'This playlist is private')])
            )
        )
    )

const addMusicToPlaylist = (
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
