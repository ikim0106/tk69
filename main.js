const auth = require('./auth.json')
const fs = require('fs')
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Player } = require('discord-player')

const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel],
})

const adminCommands = require('./commands/admin')
const musicCommands = require('./commands/music.js')

const prefix = auth.prefix

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1<<25
    }
})

// client.player.addListener('trackStart', async () => 
//     // console.log(msg)
//     // musicCommands.nowplaying(msg, client)
// )

client.on("messageCreate", (message) => {
    if (message.author.bot) return

    if (message.content.startsWith(prefix)) {
        let messageContent = message.content.substring(1)
        let splitBySpace = messageContent.split(' ')
        switch(splitBySpace[0].toUpperCase()) {
            case 'RESET':
                adminCommands.resetBot(message, client)
                break
            case 'PLAY':
                musicCommands.play(message, client, splitBySpace)
                break
            case 'DC':
                musicCommands.dc(message, client)
                break
            case 'DIE':
                musicCommands.dc(message, client)
                break
            case 'SKIPTO':
                musicCommands.skipto(message, client, splitBySpace)
                break
            case 'SKIP':
                musicCommands.skip(message, client)
                break
            case 'NEXT':
                musicCommands.skip(message, client)
                break
            case 'NEXT':
                musicCommands.skip(message, client)
                break
            case 'SHUFFLE':
                musicCommands.shuffle(message, client)
                break
            case 'QUEUE':
                musicCommands.queue(message, client)
                break
            case 'NP':
                musicCommands.nowplaying(message, client)
                break
            case 'NOWPLAYING':
                musicCommands.nowplaying(message, client)
                break
            case 'CURRENTSONG':
                musicCommands.nowplaying(message, client)
                break
            case 'TESTBUTTON':
                musicCommands.testbutton(message, client)
                break
            case 'PAUSE':
                musicCommands.pause(message, client)
                break
            case 'RESUME':
                musicCommands.resume(message, client)
                break
            case 'CLEAR':
                musicCommands.clear(message, client)
                break
            case 'PLAYSKIP':
                musicCommands.playskip(message, client, splitBySpace)
                break
        }
    }
})

client.login(auth.token)