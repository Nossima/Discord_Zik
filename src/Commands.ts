import { Command } from "./Command";
import { Play } from "./commands/play";
import { Pause } from "./commands/pause";
import { Next } from "./commands/next";
import { Stop } from "./commands/stop";
import { SearchVideo } from "./commands/search";
import { PlaylistCreate } from "./commands/playlistCreate";
import { PlaylistDelete } from "./commands/playlistDelete";

export const Commands: Command[] = [
    Play,
    Pause,
    Next,
    Stop,
    SearchVideo,
    PlaylistCreate,
    PlaylistDelete
];