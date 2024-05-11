import { Maybe, None, Some } from "monet";
import { Error, sqlError, SQLError } from "../../types/error";
import { Music, Musics } from "../../types/music";

export const insertPlaylist = (music: Music): Promise<Maybe<Error[]>> =>
    Musics()
        .insert(music)
        .then(() => None<Error[]>())
        .catch((e: SQLError) => Some([sqlError("music", e)]));
