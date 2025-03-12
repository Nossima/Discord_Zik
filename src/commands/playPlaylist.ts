import { Client } from "discord.js";
import { Command } from "../Command";
import getPlaylistByName from "../data/transactions/playlists/getByName";
import { insertPlaylist } from "../data/transactions/playlists/create";
import {Either, Left, Maybe, None, Right, Some} from "monet";
import { error, Error } from "../data/types/error";
import { Playlist } from "../data/types/playlist";
import {playMusic, waitList} from "./playUrl";

export const PlaylistCreate: Command = {
    name: "play",
    description: "Play a playlist",
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
        const user = interaction.user;

        getPlaylistByName(name)
            .then(checkIfPlaylistCanBePlayed(user.username))
            .then(playPlaylist(name, user.username))
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

const checkIfPlaylistCanBePlayed = (
    username: string
) => (errorsOrMaybePlaylist: Either<Error[], Maybe<Playlist>>): Promise<Either<Error[], Playlist>> =>
    errorsOrMaybePlaylist.cata(
        (errors) => Promise.resolve(Left(errors)),
        (maybePlaylist) => maybePlaylist.cata(
            () => Promise.resolve(Left([error('playlist', "Playlist doesn't exists")])),
            (playlist) => Promise.resolve(
                playlist.collaborative || playlist.author === username ?
                    Right(playlist) : Left([error('playlist', 'This playlist is private')])
            )
        )
    )

const playPlaylist = (
    name: string, author: string
) => (errorsOrPlaylist: Either<Error[], Playlist>): Promise<Maybe<Error[]>> =>
    errorsOrPlaylist.cata(
        (errors) => insertPlaylist({ name, author, collaborative: true })
            .then((maybeInsertErrors) => maybeInsertErrors.cata(
                () => Promise.resolve(None<Error[]>()),
                (insertErrors) => Promise.resolve(Some<Error[]>(insertErrors))
            )),
        (playlist) => {
            if (!playlist.musics ||playlist.musics?.length === 0)
                return Promise.resolve(Some([error('playlist', 'This playlist is empty')]))
            playMusic(playlist.musics[0]);
            playlist.musics.forEach((music, index) => {
                if (index !== 0) {
                    waitList.push(music)
                }
            })
            return Promise.resolve(None());
        });
