import {Client, Intents} from "discord.js";
import * as process from "process";
import * as dotenv from "dotenv";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

console.log("Bot is starting...");

dotenv.config();

const token = process.env.TOKEN || "";

const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES);

const client = new Client({ intents });

ready(client);

interactionCreate(client);

client.login(token);