const auth = require('./auth.json')
const fs = require('fs')
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js')
const { StreamType, getVoiceConnection, createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice')
const { generateDependencyReport } = require('@discordjs/voice')
const pdl = require('play-dl')

console.log(generateDependencyReport())

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
const musicCommands = require('./commands/music')
const nikkeCommands = require('./commands/nikke')

const prefix = auth.prefix || '=' //defaults to =

client.on('ready', () => {
    client.user.setActivity(`${prefix}help`, {type: ActivityType.Listening})
    client.audioPlayers = new Map()
    client.musicQueues = new Map()
    pdl.setToken(auth.youtubeCookies)
    console.log(`Logged in as ${client.user.tag}`)
})

process.on('unhandledRejection', error => {
    client.users.fetch(auth.ownerID, false).then((user) => {
        user.send(e.message)
    })
    console.log('ERROR LOG', error.message)
})


client.on("messageCreate", (message) => {
    if (message.author.bot) return

    if (message.content.startsWith(prefix)) {
        let messageContent = message.content.substring(1)
        let args = messageContent.split(' ')
        let command = args[0]
        args.shift()

        switch(command.toUpperCase()) {
            case 'HELP':
                adminCommands.help(message)
                break
            case 'RESET':
                adminCommands.resetBot(message, client)
                break
            case 'PLAY':
                musicCommands.play(message, client, args)
                break
            case 'P':
                musicCommands.play(message, client, args)
                break
            case 'DIE':
                musicCommands.die(message, client)
                break
            case 'DC':
                musicCommands.die(message, client)
                break
            case 'PAUSE':
                musicCommands.pause(message, client)
                break
            case 'RESUME':
                musicCommands.resume(message, client)
                break
            case 'SKIP':
                musicCommands.skip(message, client)
                break
            case 'NOWPLAYING':
                musicCommands.nowplaying(message, client)
                break
            case 'NP':
                musicCommands.nowplaying(message, client)
                break
            case 'PLAYSKIP':
                musicCommands.playskip(message, client, args)
                break
            case 'SHUFFLE':
                musicCommands.shuffle(message, client)
                break
            case 'QUEUE':
                musicCommands.queue(message, client)
                break
            case 'Q':
                musicCommands.queue(message, client)
                break
            case 'MOVE':
                musicCommands.move(message, client, args)
                break
            case 'SEEK':
                musicCommands.seek(message, client, args)
                break
            case 'REMOVE':
                musicCommands.remove(message, client, args)
                break
            case 'REPEAT':
                musicCommands.repeat(message, client, args)
                break
            case 'TIERLIST':
                nikkeCommands.tierlist(message, args)
                break
        }
    }
})

client.login(auth.token)