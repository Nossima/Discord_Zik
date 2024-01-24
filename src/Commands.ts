import { Command } from "./Command";
import { Play } from "./commands/play";
import { Pause } from "./commands/pause";
import { Next } from "./commands/next";
import { Stop } from "./commands/stop";

export const Commands: Command[] = [Play, Pause, Next, Stop];