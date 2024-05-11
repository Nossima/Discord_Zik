import { Playlist, Playlists } from "../../types/playlist";
import { Maybe, None, Some } from "monet";
import { Error, sqlError, SQLError } from "../../types/error";

export const insertPlaylist = (playlist: Playlist): Promise<Maybe<Error[]>> =>
    Playlists()
        .insert(playlist)
        .then(() => None<Error[]>())
        .catch((e: SQLError) => Some([sqlError("playlist", e)]));
