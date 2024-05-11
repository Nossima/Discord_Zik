import { Client, Intents } from "discord.js";
import * as process from "process";
import * as dotenv from "dotenv";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import { YoutubeDataAPI } from "youtube-v3-api";
import knex from "knex";
import * as path from "path";

console.log("Bot is starting...");

dotenv.config();

const token = process.env.TOKEN_BETA || "";
export const apiKey = process.env.API_KEY || "";

const intents = new Intents();
intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
);

const client = new Client({ intents });
export const youtubeApi = new YoutubeDataAPI(apiKey);

export const database = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, './data/zik.db3'),
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.join(__dirname, './data/migrations'),
    },
    seeds: {
        directory: path.join(__dirname, './data/seeds'),
    }
});

ready(client);

interactionCreate(client);

client.login(token);