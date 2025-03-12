import { sqlError, Error, SQLError } from "../../types/error";
import { Either, Left, Maybe, Right } from "monet";
import {Music, musicFromRow, MusicRow, Musics} from "../../types/music";

const getMusicByName = (name: string): Promise<Either<Error[], Maybe<Music>>> =>
    Musics()
        .where({ name })
        .first()
        .then((row) =>
            Right<Error[], Maybe<Music>>(
                Maybe.fromNull(row).map(musicFromRow)
            )
        )
        .catch((e: SQLError) => Left([sqlError("music", e)]));

export const getMusicByNameRaw = (name: string): Promise<Either<Error[], Maybe<MusicRow>>> =>
    Musics()
        .where({ name })
        .first()
        .then((row) =>
            Right<Error[], Maybe<MusicRow>>(Maybe.fromNull(row))
        )
        .catch((e: SQLError) => Left([sqlError("music", e)]));

export default getMusicByName;