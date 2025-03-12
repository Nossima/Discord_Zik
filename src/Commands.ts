import { Command } from "./Command";
import { PlayUrl } from "./commands/playUrl";
import { Pause } from "./commands/pause";
import { Next } from "./commands/next";
import { Stop } from "./commands/stop";
import { SearchVideo } from "./commands/search";
import { PlaylistCreate } from "./commands/playlistCreate";
import { PlaylistDelete } from "./commands/playlistDelete";
import { WaitList } from "./commands/waitlist";
import {SetAvatar} from "./commands/setAvatar";

export const Commands: Command[] = [
    SetAvatar,
    PlayUrl,
    Pause,
    Next,
    Stop,
    SearchVideo,
    PlaylistCreate,
    PlaylistDelete,
    WaitList
];