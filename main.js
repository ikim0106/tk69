const auth = require('./auth.json')
const fs = require('fs')
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { StreamType, getVoiceConnection, createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice')
const { generateDependencyReport } = require('@discordjs/voice')

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
const musicCommands = require('./commands/music.js')

const prefix = auth.prefix

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
    client.player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
        },
    })
    client.player.musicQueues = new Map()
})

client.on("messageCreate", (message) => {
    if (message.author.bot) return

    if (message.content.startsWith(prefix)) {
        let messageContent = message.content.substring(1)
        let args = messageContent.split(' ')
        let command = args[0]
        args.shift()

        switch(command.toUpperCase()) {
            case 'RESET':
                adminCommands.resetBot(message, client)
                break
            case 'PLAY':
                musicCommands.play(message, client, args)
                break
            case 'PLAYSTATUS':
                musicCommands.playstatus(message, client)
        }
    }
})

client.login(auth.token)