"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const v9_1 = require("discord-api-types/v9");
const discord_js_1 = require("discord.js");
const adapter_1 = require("./adapter");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { token } = require('../config.json');
/**
 * 	In this example, we are creating a single audio player that plays to a number of voice channels.
 * The audio player will play a single track.
 */
/**
 * Create the audio player. We will use this for all of our connections.
 */
const player = (0, voice_1.createAudioPlayer)();
function playSong() {
    /**
     * Here we are creating an audio resource using a sample song freely available online
     * (see https://www.soundhelix.com/audio-examples)
     *
     * We specify an arbitrary inputType. This means that we aren't too sure what the format of
     * the input is, and that we'd like to have this converted into a format we can use. If we
     * were using an Ogg or WebM source, then we could change this value. However, for now we
     * will leave this as arbitrary.
     */
    const resource = (0, voice_1.createAudioResource)('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', {
        inputType: voice_1.StreamType.Arbitrary,
    });
    /**
     * We will now play this to the audio player. By default, the audio player will not play until
     * at least one voice connection is subscribed to it, so it is fine to attach our resource to the
     * audio player this early.
     */
    player.play(resource);
    /**
     * Here we are using a helper function. It will resolve if the player enters the Playing
     * state within 5 seconds, otherwise it will reject with an error.
     */
    return (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Playing, 5000);
}
async function connectToChannel(channel) {
    /**
     * Here, we try to establish a connection to a voice channel. If we're already connected
     * to this voice channel, @discordjs/voice will just return the existing connection for us!
     */
    const connection = (0, voice_1.joinVoiceChannel)({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: (0, adapter_1.createDiscordJSAdapter)(channel),
    });
    /**
     * If we're dealing with a connection that isn't yet Ready, we can set a reasonable
     * time limit before giving up. In this example, we give the voice connection 30 seconds
     * to enter the ready state before giving up.
     */
    try {
        /**
         * Allow ourselves 30 seconds to join the voice channel. If we do not join within then,
         * an error is thrown.
         */
        await (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 30000);
        /**
         * At this point, the voice connection is ready within 30 seconds! This means we can
         * start playing audio in the voice channel. We return the connection so it can be
         * used by the caller.
         */
        return connection;
    }
    catch (error) {
        /**
         * At this point, the voice connection has not entered the Ready state. We should make
         * sure to destroy it, and propagate the error by throwing it, so that the calling function
         * is aware that we failed to connect to the channel.
         */
        connection.destroy();
        throw error;
    }
}
/**
 * Main code
 * =========
 * Here we will implement the helper functions that we have defined above.
 */
const client = new discord_js_1.Client({
    intents: [v9_1.GatewayIntentBits.Guilds, v9_1.GatewayIntentBits.GuildMessages, v9_1.GatewayIntentBits.GuildVoiceStates],
});
client.on('ready', async () => {
    console.log('Discord.js client is ready!');
    /**
     * Try to get our song ready to play for when the bot joins a voice channel
     */
    try {
        await playSong();
        console.log('Song is ready to play!');
    }
    catch (error) {
        /**
         * The song isn't ready to play for some reason :(
         */
        console.error(error);
    }
});
client.on('messageCreate', async (message) => {
    if (!message.guild)
        return;
    if (message.content === '-join') {
        const channel = message.member?.voice.channel;
        if (channel) {
            /**
             * The user is in a voice channel, try to connect.
             */
            try {
                const connection = await connectToChannel(channel);
                /**
                 * We have successfully connected! Now we can subscribe our connection to
                 * the player. This means that the player will play audio in the user's
                 * voice channel.
                 */
                connection.subscribe(player);
                await message.reply('Playing now!');
            }
            catch (error) {
                /**
                 * Unable to connect to the voice channel within 30 seconds :(
                 */
                console.error(error);
            }
        }
        else {
            /**
             * The user is not in a voice channel.
             */
            void message.reply('Join a voice channel then try again!');
        }
    }
});
void client.login(token);
//# sourceMappingURL=main.js.map