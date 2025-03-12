import {Client, CommandInteraction, User} from "discord.js";
import { Command } from "../Command";
import getPlaylistByName, {getPlaylistByNameRaw} from "../data/transactions/playlists/getByName";
import { insertPlaylist } from "../data/transactions/playlists/create";
import {Either, Left, Maybe, None, Right, Some} from "monet";
import { error, Error } from "../data/types/error";
import {Playlist, PlaylistRow} from "../data/types/playlist";
import {Music, MusicRow} from "../data/types/music";
import getMusicByName, {getMusicByNameRaw} from "../data/transactions/musics/getByName";
import {insertMusic} from "../data/transactions/musics/create";
import {SelectMenuInteraction} from "discord.js/typings";

export const PlaylistAddUrl: Command = {
    name: "addUrl",
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
        },{
            name: "author",
            description: "author of the music",
            type: 3,
            required: false
        }
    ],
    run: async (client: Client, interaction) => {
        const playlist = interaction.options.get("playlist")?.value as string;
        const url = interaction.options.get("url")?.value as string;
        const name = interaction.options.get("name")?.value as string;
        const user = interaction.user;

        playlistAddUrl(interaction, user, playlist, url, name);
    }
};

export const playlistAddUrl = (interaction: CommandInteraction | SelectMenuInteraction, user: User, playlist: string, url: string, name: string, author?: string) => {
    let playlistId: number = -1;

    getPlaylistByNameRaw(playlist)
        .then(checkIfPlaylistCanBeEdited(user.username))
        .then((errorOrPlaylistId) => {
                errorOrPlaylistId.cata(
                    (errors) => null,
                    (playlist) => {
                        playlistId = playlist.id;
                    }
                )
            return errorOrPlaylistId;
            }
        )
        .then(checkIfPlaylistHasMusic(name))
        .then(checkIfMusicCanBeCreated(url, name, author))
        .then(addMusicToPlaylist(playlistId))
        .then((maybeErrors) => maybeErrors.cata(
            () => {
                interaction.followUp(`Music added to ${playlist}`)
            },
            (errors) => {
                console.log(errors)
                interaction.followUp(`An error occurred: ${errors[0].message}`)
            }
        ));
}

const checkIfPlaylistCanBeEdited = (
    username: string
) => (errorsOrMaybePlaylist: Either<Error[], Maybe<PlaylistRow>>): Promise<Either<Error[], PlaylistRow>> =>
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

const checkIfPlaylistHasMusic = (
    name: string
) => (errorsOrPlaylist: Either<Error[], PlaylistRow>): Promise<Either<Error[], number>> =>
    errorsOrPlaylist.cata(
        (errors) => Promise.resolve(Left(errors)),
        (playlist) => Promise.resolve(
            playlist.
        )maybePlaylist.cata(
            () => Promise.resolve(Left([error('playlist', "Playlist doesn't exists")])),
            (playlist) => Promise.resolve(
                playlist.collaborative || playlist.author === username ?
                    Right(playlist.id) : Left([error('playlist', 'This playlist is private')])
            )
        )
    )

const checkIfMusicCanBeCreated = (
    url: string, name: string, author?: string
) => (maybeErrors: Maybe<Error[]>): Promise<Either<Error[], MusicRow>> =>
    maybeErrors.cata(
        () => getMusicByNameRaw(name)
            .then((errorsOrMusic) => errorsOrMusic.cata(
                (errors) => Promise.resolve(Left(errors)),
                (maybeMusic) => maybeMusic.cata(
                    () => Promise.resolve(createMusic(url, name, author)),
                    (music) => Promise.resolve(Right(music))
                )
            )),
        (errors) => Promise.resolve(Left(errors))
    );

const createMusic = (
    url: string, name: string, author?: string
): Promise<Either<Error[], MusicRow>> => {
    const music: Music = { url, name, author };

    return insertMusic(music)
        .then((maybeCreateErrors) => maybeCreateErrors.cata(
            (createErrors) => Promise.resolve(Left(createErrors)),
            (id) => Promise.resolve(Right({ ...music, id }))
        ))
}


const addMusicToPlaylist = (playlistId: number) => (errorsOrMusic: Either<Error[], MusicRow>): Promise<Maybe<Error[]>> => {
    console.log(errorsOrMusic)
    return Promise.resolve(None())
}
        // getMusicByNameRaw(name)
        //     .then((errorsOrMusic) => errorsOrMusic.cata(
        //         (errors) => Promise.resolve(Some(errors),
        //         (music) =>
        //     ))
