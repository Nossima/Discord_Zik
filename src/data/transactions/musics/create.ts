import {Either, Left, Maybe, None, Right, Some} from "monet";
import {error, Error, sqlError, SQLError} from "../../types/error";
import { Music, Musics } from "../../types/music";

export const insertMusic = (music: Music): Promise<Either<Error[], number>> =>
    Musics()
        .insert(music)
        .returning("id")
        .then((id: { id: number }[]) => {
            if (id.length > 0)
                return Right<Error[], number>(id[0].id);
            return Left<Error[], number>([error('music', 'id could not be retrieved')]);
        })
        .catch((e: SQLError) => Left([sqlError("music", e)]));
