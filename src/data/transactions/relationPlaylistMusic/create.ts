import {Either, Left, Maybe, None, Right, Some} from "monet";
import {error, Error, sqlError, SQLError} from "../../types/error";
import { Music, Musics } from "../../types/music";
import {RelationPlaylistMusic, RelationsPlaylistMusic} from "../../types/playlist";

export const insertMusic = (relation: RelationPlaylistMusic): Promise<Either<Error[], number>> =>
    RelationsPlaylistMusic()
        .insert(relation)
        .returning("id")
        .then((id: { id: number }[]) => {
            if (id.length > 0)
                return Right<Error[], number>(id[0].id);
            return Left<Error[], number>([error('relation', 'id could not be retrieved')]);
        })
        .catch((e: SQLError) => Left([sqlError("relation", e)]));
