import { Playlists } from "../../types/playlist";
import { Maybe, None, Some } from "monet";
import {error, Error, sqlError, SQLError} from "../../types/error";

export const removePlaylist = (name: string): Promise<Maybe<Error[]>> =>
    Playlists()
        .delete()
        .where({ name })
        .then((res) =>
            res === 1 ? None<Error[]>() : Some([error("playlist", "No playlist found")])
        )
        .catch((e: SQLError) => Some([sqlError("playlist", e)]));
