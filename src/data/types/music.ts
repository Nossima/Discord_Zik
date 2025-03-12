import {database} from "../../Bot";

export const Musics = () => database('musics');

export interface Music {
    url: string,
    name: string,
    author?: string,
}

export interface MusicRow {
    id: number,
    url: string,
    name: string,
    author?: string
}

export const musicFromRow = (musicRow: MusicRow): Music => {
    return ({
        url: musicRow.url,
        name: musicRow.name,
        author: musicRow.author
    } as Music);
}

export type MusicState = "play" | "wait" | "pause" | "none" | "error";