import {Client, GatewayIntentBits} from "discord.js";
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

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions
];

export const client = new Client({ intents });

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