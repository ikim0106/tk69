const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events 
} = require("discord.js")
const pdl = require('play-dl')
const auth = require('../auth.json')

const { StreamType, getVoiceConnection, createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice')

const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
    return array
}

exports.play = async function(message, client, args) {
    try {
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)

        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }

        if(!args.length) {
            message.reply('You have not provided a track')
            return
        }
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        connection.addListener('stateChange', async(e)=> {
            if(connection._state.status==='disconnected') {
                if(connection._state.reason) return
                let audioPlayer = client.audioPlayers.get(guild.id)
                audioPlayer.stop()
                audioPlayer.removeAllListeners()
                client.musicQueues.set(guild.id, [])
                client.audioPlayers.delete(guild.id)
                connection.destroy()
                // console.log(client.musicQueues.get(guild.id), client.audioPlayers.get(guild.id))
            }
        })
        
        let string = args.join(' ')

        if(!client.audioPlayers.get(guild.id)) {
            client.audioPlayers.set(guild.id, createAudioPlayer({
                behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            }}))
            client.audioPlayers.get(guild.id).addListener('stateChange', async (e) => {
                let player = client.audioPlayers.get(guild.id)
                if(player._state.status === 'idle') {
                    let queue = client.musicQueues.get(e.resource.metadata.guildId)
                    if(queue.length) {
                        let sauce = client.musicQueues.get(e.resource.metadata.guildId).shift()
                        let song = await pdl.video_info(sauce[0])
                        const source = await pdl.stream(sauce[0], {
                            quality: 3
                        })
                        let track = createAudioResource(source.stream, {
                            inlineVolume: false,
                            metadata: {
                                songData: song.video_details,
                                requestedBy: sauce[1],
                                tcId: e.resource.metadata.tcId,
                                guildId: e.resource.metadata.guildId,
                                vcId: e.resource.metadata.vcId
                            },
                            inputType: source.type,
                        })
                        player.play(track)
                    }
                }
                // console.log('player:', player._state.status)
            }) 
        }
        
        if(!client.musicQueues.get(guild.id)) {
            client.musicQueues.set(guild.id, [])
        }
        
        let msg
        if (args[0].startsWith('https') && pdl.yt_validate(args[0]) === 'video') {
            let song = await pdl.video_info(args[0])
            client.musicQueues.get(guild.id).push([args[0], message.author, song.video_details.title])
            msg = `Added **${song.video_details.title}** to the queue`
        }
        else if(args[0].startsWith('https') && pdl.yt_validate(args[0]) === 'playlist') {
            const playlistInfo = await pdl.playlist_info(string, {incomplete: true})
            playlistInfo.videos.forEach(element => client.musicQueues.get(guild.id).push([element.url, message.author, element.title]))
            msg = `Added **${playlistInfo.videos.length} tracks** from [**${playlistInfo.title}**] to the queue`
        }
        else {
            const searchRes = await pdl.search(string, {
                source: {youtube: 'video'},
                limit:1
            })
            if(!searchRes || !searchRes.length) {
                message.reply(`No songs were found for **${string}**`)
                return
            }
            msg = `Added **${searchRes[0].title}** to the queue`
            client.musicQueues.get(guild.id).push([searchRes[0].url, message.author, searchRes[0].title])
        }
        
        let player = client.audioPlayers.get(guild.id)
        if(player._state.status==='idle') {
            let sauce = client.musicQueues.get(guild.id).shift()
            let sourceURL = sauce[0]
            const source = await pdl.stream(sourceURL, {
                quality: 3
            })
            let song = await pdl.video_info(sourceURL)
            let track = createAudioResource(source.stream, {
                inlineVolume: false,
                metadata: {
                    songData: song.video_details,
                    requestedBy: sauce[1],
                    tcId: message.channel.id,
                    guildId: guild.id,
                    vcId: member.voice.channel.id
                },
                inputType: source.type,
            })
            connection.subscribe(player)
            player.play(track)

            const embed = new EmbedBuilder()
                .setColor('0xFFFDD1')
                .setTitle(`Now playing: ${song.video_details.title}`)
                .setThumbnail(song.video_details.thumbnails[song.video_details.thumbnails.length-1].url)
                .setDescription(`${song.video_details.url}\n\nPlaying in ${member.voice.channel.name}`)
                .setAuthor({
                    iconURL: sauce[1].avatarURL(),
                    name: `Requested by: ${sauce[1].username}#${sauce[1].discriminator}`
                })
            await message.reply({
                content: msg,
                embeds: [embed]
            })
        }
        else {
            message.reply(msg)
        }
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
    return
}

exports.playstatus = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        let player = client.audioPlayers.get(guild.id)
        console.log(player._state.resource.metadata)
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
    }
}

exports.die = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)

        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }

        let voiceConnection = getVoiceConnection(guild.id)

        if(!voiceConnection) {
            message.reply('im not even in a vc and u try to kill me i slap your whole family')
            return
        }
        let audioPlayer = client.audioPlayers.get(guild.id)
        if(!audioPlayer || audioPlayer._state.status==='idle') {
            console.log(audioPlayer)
            return
        }

        message.react('⏹️')
        audioPlayer.stop()
        audioPlayer.removeAllListeners()
        client.musicQueues.set(guild.id, [])
        client.audioPlayers.delete(guild.id)
        voiceConnection.disconnect()
        voiceConnection.destroy()
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
    return
}

exports.pause = async function(message, client) {
    try {
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)

        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }

        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player || player._state.status === 'idle') {
            message.reply('No track to pause')
            return
        }
        message.react('⏸️')
        client.audioPlayers.get(guild.id).pause()
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
    // console.log(client.audioPlayers.get(guild.id))
}

exports.resume = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)

        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }

        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player || player._state.status === 'idle') {
            message.reply('No track to resume')
            return
        }
        message.react('▶️')
        client.audioPlayers.get(guild.id).unpause()
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
    // console.log(client.audioPlayers.get(guild.id))
}

exports.skip = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player || player._state.status === 'idle') {
            message.reply('No track to skip')
            return
        }
        
        if(!queue.length && player._state.status === 'playing') {
            message.react('⏭️')
            client.audioPlayers.get(guild.id).stop()
            return
        }
        else if(!queue.length && player._state.status === 'idle') {
            message.reply('skip your lanjiao nothing playing and no song in queue still want to skip? cb no brain')
            return
        }
        
        if(player._state.status === 'paused') {
            client.audioPlayers.get(guild.id).unpause()
        }
        message.react('⏭️')
        client.audioPlayers.get(guild.id).stop()
        message.reply(`Skipped to **${queue[0][2]}**`)
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.nowplaying = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)

        if(!queue || !player || player._state.status === 'idle') {
            message.reply('No tracks playing')
            return
        }

        let songData = player._state.resource.metadata.songData
        let date1 = new Date(0), date2 = new Date(0)
        date1.setMilliseconds(player._state.resource.playbackDuration)
        date2.setSeconds(songData.durationInSec)
        let date1String, date2String
        if(songData.durationInSec>=3600) {
            date1String = date1.toISOString().substring(11,19)
            date2String = date2.toISOString().substring(11,19)
        }
        else if(songData.durationInSec>=600) {
            date1String = date1.toISOString().substring(14,19)
            date2String = date2.toISOString().substring(14,19)
        }
        else {
            date1String = date1.toISOString().substring(15,19)
            date2String = date2.toISOString().substring(15,19)
        }
        let percent = Math.round(Math.floor(player._state.resource.playbackDuration/1000)/songData.durationInSec*160)/160
        let progressBar = ''
        for(let i=1; i<16*percent; i++)
            progressBar+= '▬'
        progressBar+= '🔘'
        for(let i=0; i<16-16*percent; i++)
            progressBar+= '▬'
        
        let userData = player._state.resource.metadata.requestedBy
        const embed = new EmbedBuilder()
        .setColor('0xFFFDD1')
        .setTitle(`Currently playing: ${songData.title}`)
        .setThumbnail(songData.thumbnails[songData.thumbnails.length-1].url)
        .setDescription(`${date1String}\u200b \u200b |\u200b \u200b ${progressBar}\u200b \u200b |\u200b \u200b  ${date2String}\n\n${songData.url}\n\nPlaying in ${member.voice.channel.name}`)
        .setAuthor({
            iconURL: userData.avatarURL(),
            name: `Requested by: ${userData.username}#${userData.discriminator}`
        })
        await message.reply({
            embeds: [embed]
        })
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.playskip = async function(message, client, args) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        const string = args.join(' ')
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player || player._state.status === 'idle') {
            message.reply('No track playing to playskip')
            return
        }

        if(!client.musicQueues.get(guild.id)) {
            client.musicQueues.set(guild.id, [])
        }
        
        if((player._state.status === 'playing') || player._state.status === 'paused') {
            let msg
            if (args[0].startsWith('https') && pdl.yt_validate(args[0]) === 'video') {
                client.musicQueues.get(guild.id).unshift([args[0], message.author])
                let song = await pdl.video_info(args[0])
                msg = `Skipped the current track to play **${song.video_details.title}**`
                // console.log(msg)
            }
            else if(args[0].startsWith('https') && pdl.yt_validate(args[0]) === 'playlist') {
                message.reply('You may not use a playlist with this command')
                return
            }
            else {
                const searchRes = await pdl.search(string, {
                    source: {youtube: 'video'},
                    limit:1
                })
                if(!searchRes || !searchRes.length) {
                    message.reply(`No songs were found for **${string}**`)
                    return
                }
                msg = `Skipped the current track to play **${searchRes[0].title}**`
                client.musicQueues.get(guild.id).unshift([searchRes[0].url, message.author, searchRes[0].title])
            }
            message.react('⏭️')
            message.reply(msg)
            client.audioPlayers.get(guild.id).stop()
            return
        }
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.shuffle = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !queue.length || !player || player._state.status === 'idle') {
            message.reply('Nothing in queue to shuffle')
            return
        }

        client.musicQueues.set(guild.id, shuffle(queue))
        message.react('🔀')
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.queue = async function(message, client) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }

        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }

        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)

        if(!queue || !queue.length || !player || player._state.status === 'idle') {
            message.reply('Queue is empty')
            return
        }

        let totalPages = Math.ceil(queue.length/10)
        let currentPage = 1
        let specialcase=0

        if(currentPage===totalPages) {
            specialcase=queue.length%10
        }
        else specialcase=10

        let kontent = `**Up next**\n`
        for(let i=1; i<specialcase+1; i++) {
            kontent += `\`${(currentPage-1)*10+i}\` **|**\u200b \u200b ${queue[(currentPage-1)*10+(i-1)][2]}\n`
        }
        kontent += `\n**Page ${currentPage} of ${totalPages}**`

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previouspage')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('◀️'),
                new ButtonBuilder()
                    .setCustomId('nextpage')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            )

        const embed = new EmbedBuilder()
            .setColor('0xFFFDD1')
            .setTitle(`🎵 Current queue  |  ${queue.length} tracks`)
            .setDescription(kontent)
        const reply = await message.reply({embeds: [embed], components: [row]})
        const collector = reply.createMessageComponentCollector()
        collector.on('collect', async button => {
            if(!queue || !player) {
                collector.stop()
                reply.edit('Queue as expired')
                return
            }
            button.deferUpdate()
            // console.log(button)
            if(!queue) return

            if(queue && button.customId === 'previouspage') {
                if(currentPage===1) return
                else currentPage--
            }
            else if(queue && button.customId === 'nextpage') {
                if(currentPage===totalPages) return
                else currentPage++
            }
            else return

            kontent=`**Up Next**\n`
            specialcase=0
            if(currentPage===totalPages) {
                specialcase=queue.length%10
            }
            else specialcase=10

            for(let i=1; i<specialcase+1; i++) {
                kontent += `\`${(currentPage-1)*10+i}\` **|**\u200b \u200b ${queue[(currentPage-1)*10+(i-1)][2]}\n`
            }
            kontent += `\n**Page ${currentPage} of ${totalPages}**`

            const embed = new EmbedBuilder()
                .setColor('0xFFFDD1')
                .setTitle(`🎵 Current queue | ${queue.length} tracks`)
                .setDescription(kontent)

            reply.edit({embeds: [embed]})
        })
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.move = async function(message, client, args) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        let queue = client.musicQueues.get(guild.id)

        if(!member.voice.channel) {
            message.reply("You are not in a voice channel")
            return
        }

        if(!queue) {
            message.reply('No songs in queue')
            return
        }

        // args.shift()
        args[0] = parseInt(args[0])
        args[1] = parseInt(args[1])

        if(isNaN(args[0]) || isNaN(args[1])) {
            message.reply('Incorrect usage of move command')
            return
        }

        let positionFirst = queue[args[0]-1]
        let positionSecond = queue[args[1]-1]

        if(!positionFirst || !positionSecond) {
            message.reply('At least one of the indexes provided is invalid')
            return
        }

        queue[args[1]-1] = positionFirst
        queue[args[0]-1] = positionSecond

        client.musicQueues.set(guild.id, queue)
        message.reply(`Swapped **${positionFirst[2]}** with **${positionSecond[2]}**`)
    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.seek = async function(message, client, args) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player || !player._state.status === 'playing') {
            message.reply('Nothing song playing to seek')
            return
        }
        if(!args.length) {
            message.reply('fuck you')
            return
        }

        let secs=0
        args.forEach((element) => {
            if((element.includes('h') && element.includes('m')) || (element.includes('h') && element.includes('s')) || (element.includes('s') && element.includes('m'))) {
                message.reply('Invalid format')
                return
            }
            if(!element.includes('h') && !element.includes('m') && !element.includes('s')) {
                let segs = element.split('s')
                segs = parseInt(segs)
                secs += segs
            }
            if(element.includes('h')) {
                let hrs = element.split('h')
                hrs = parseInt(hrs)
                secs = hrs*3600
            }
            if(element.includes('m')) {
                let mts = element.split('m')
                mts = parseInt(mts)
                secs += mts*60
            }
            if(element.includes('s')) {
                let segs = element.split('s')
                segs = parseInt(segs)
                secs += segs
            }
        })

        let sauce = player._state.resource.metadata
        let song = await pdl.video_info(sauce.songData.url)
        const source = await pdl.stream(sauce.songData.url, {
            seek: secs,
            quality: 2
        })
        let track = createAudioResource(source.stream, {
            inlineVolume: false,
            metadata: {
                songData: song.video_details,
                requestedBy: sauce.requestedBy,
                tcId: sauce.tcId,
                guildId: sauce.guildId,
                vcId: sauce.vcId
            },
            inputType: source.type,
        })
        player.play(track)
        message.react('👌')
    } 
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        if(e.message.startsWith('Seeking beyond limit.')) message.reply('Cannot seek beyond song limit')
        else message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}

exports.remove = async function(message, client, args) {
    try{
        if(!message.guildId) {
            message.reply('You cannot use this command in a dm')
            return
        }
        const guild = client.guilds.cache.get(message.channel.guildId)
        const member = guild.members.cache.get(message.author.id)
        
        if(!member.voice.channel) {
            message.reply('You are not in a voice channel')
            return
        }
        
        let queue = client.musicQueues.get(guild.id)
        let player = client.audioPlayers.get(guild.id)
        if(!queue || !player) {
            message.reply('Invalid index')
            return
        }
        args[0] = parseInt(args[0])
        if(isNaN(args[0])) {
            message.reply('Invalid number provided')
            return
        }
        // console.log(args[0])

        let track = queue[args[0]-1]
        if(track) {
            queue.splice(args[0]-1, 1)
            client.musicQueues.set(guild.id, queue)
            message.reply(`Removed **${track[2]}** from the queue`)
        }
        else {
            return
        }

    }
    catch(e) {
        client.users.fetch(auth.ownerID, false).then((user) => {
            user.send(e.message)
        })
        message.reply(`Unknown error occured. Contact <@${auth.ownerID}> regarding this issue`)
    }
}