import { Music } from "./music";
import { database } from "../../Bot";

export const Playlists = () => database('playlists');

export interface Playlist {
    name: string,
    author: string,
    collaborative: boolean,
    musics?: Music[]
}

export interface PlaylistRow {
    name: string,
    author: string,
    collaborative: boolean
}

export const playlistFromRow = (playlistRow: PlaylistRow): Playlist => {
    return ({
        name: playlistRow.name,
        author: playlistRow.author,
        collaborative: playlistRow.collaborative,
        musics: []
    } as Playlist);
}

export const playlistsFromRow = (playlistRows: PlaylistRow[]): Playlist[] => {
    return playlistRows.map(playlistFromRow);
}