import {Playlist, Playlists, playlistsFromRow} from "../../types/playlist";
import { sqlError, Error, SQLError } from "../../types/error";
import { Either, Left, Right } from "monet";

const getAllPlaylists = (): Promise<Either<Error[], Playlist[]>> =>
    Playlists()
        .select("*")
        .then((rows) =>
            Right<Error[], Playlist[]>(playlistsFromRow(rows))
        )
        .catch((e: SQLError) => Left([sqlError("playlist", e)]));

export default getAllPlaylists;