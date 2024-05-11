import { Playlist, playlistFromRow, Playlists } from "../../types/playlist";
import { sqlError, Error, SQLError } from "../../types/error";
import { Either, Left, Maybe, Right } from "monet";

const getPlaylistByName = (name: string): Promise<Either<Error[], Maybe<Playlist>>> =>
    Playlists()
        .where({ name })
        .first()
        .then((row) =>
            Right<Error[], Maybe<Playlist>>(
                Maybe.fromNull(row).map(playlistFromRow)
            )
        )
        .catch((e: SQLError) => Left([sqlError("playlist", e)]));

export default getPlaylistByName;