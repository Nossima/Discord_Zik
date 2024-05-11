import { Maybe, None, Some } from "monet";
import { error, Error, sqlError, SQLError } from "../../types/error";
import { Musics } from "../../types/music";

export const removeMusic = (name: string): Promise<Maybe<Error[]>> =>
    Musics()
        .delete()
        .where({ name })
        .then((res) =>
            res === 1 ? None<Error[]>() : Some([error("music", "No music found")])
        )
        .catch((e: SQLError) => Some([sqlError("music", e)]));
