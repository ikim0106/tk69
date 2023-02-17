const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events 
} = require("discord.js")
const pdl = require('play-dl')

const { StreamType, getVoiceConnection, createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice')

const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
  
    return array
  }

exports.play = async function(message, client, args) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
        return
    }
    const guild = client.guilds.cache.get(message.channel.guildId)
    const member = guild.members.cache.get(message.author.id)

    if(!member.voice.channel) {
        message.reply('You are not in a voice channel')
        return
    }

    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
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
            console.log('player:', player._state.status)
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
        console.log(msg)
    }
    else if(args[0].startsWith('https') && pdl.yt_validate(args[0]) === 'playlist') {
        const playlistInfo = await pdl.playlist_info(string, {incomplete: true})
        playlistInfo.videos.forEach(element => client.musicQueues.get(guild.id).push([element.url, message.author, element.title]))
        msg = `Added **${playlistInfo.videos.length} tracks** from [**${playlistInfo.title}**] to the queue`
        console.log(msg)
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
        console.log(msg)
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
    return
}

exports.playstatus = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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

exports.die = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
    message.react('⏹️')
    audioPlayer.stop()
    audioPlayer.removeAllListeners()
    client.musicQueues.set(guild.id, [])
    client.audioPlayers.delete(guild.id)
    voiceConnection.disconnect()
    voiceConnection.destroy()
    return
}

exports.pause = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
    // console.log(client.audioPlayers.get(guild.id))
}

exports.resume = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
    // console.log(client.audioPlayers.get(guild.id))
}

exports.skip = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
}

exports.nowplaying = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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

exports.playskip = async function(message, client, args) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
    
    if((!queue.length && player._state.status === 'playing') || player._state.status === 'paused') {
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
            msg = `Added **${searchRes[0].title}** to the queue`
            console.log(msg)
            client.musicQueues.get(guild.id).unshift([searchRes[0].url, message.author])
        }
        message.react('⏭️')
        message.reply(msg)
        client.audioPlayers.get(guild.id).stop()
        return
    }
}

exports.shuffle = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
        message.reply('Nothing in queue to shuffle')
        return
    }

    client.musicQueues.set(guild.id, shuffle(queue))
    message.react('🔀')

}

exports.queue = async function(message, client) {
    if(!message.guildId) {
        message.reply('you cannot use this command in a dm')
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
        kontent += `\`${(currentPage-1)*10+i}\` **|**  ${queue[(currentPage-1)*10+(i-1)][2]}\n`
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
            kontent += `\`${(currentPage-1)*10+i}\` **|**  ${queue[(currentPage-1)*10+(i-1)][2]}\n`
        }
        kontent += `\n**Page ${currentPage} of ${totalPages}**`

        const embed = new EmbedBuilder()
            .setColor('0xFFFDD1')
            .setTitle(`🎵 Current queue | ${queue.length} tracks`)
            .setDescription(kontent)

        reply.edit({embeds: [embed]})
    })
}

// exports.play = async function(message, client, args) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }

//     let originalString=''
//     for(let i=1; i<args.length-1; i++) {
//         originalString = originalString+args[i]+' '
//     }
//     originalString+=args[args.length-1]
//     if(originalString==='play' || originalString===' ') return
//     console.log(originalString)

//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.reply('you are not in a voice channel')
//         return
//     }
//     const queue = await client.player.createQueue(guild)

//     if(!queue.connection) await queue.connect(member.voice.channel)

//     let searchEngine = QueryType.AUTO
//     if(originalString.includes('spotify') && originalString.includes('playlist'))
//         searchEngine = QueryType.SPOTIFY_PLAYLIST
//     else if(originalString.includes('youtube') && !originalString.includes('list'))
//         searchEngine = QueryType.YOUTUBE_VIDEO
//     else if(originalString.includes('youtube') && originalString.includes('list'))
//         searchEngine = QueryType.YOUTUBE_PLAYLIST
//     else if(originalString.includes('spotify') && !originalString.includes('playlist'))
//         searchEngine = QueryType.SPOTIFY_SONG

//     const result = await client.player.search(originalString, {
//         requestedBy: message.author,
//         searchEngine: searchEngine
//     })
    
//     if(result.tracks.length === 0) {
//         message.reply('no results')
//         return
//     }

//     let songContent=``
//     if(result.playlist) {
//         await queue.addTracks(result.tracks)
//         songContent=`Added **${result.tracks.length} tracks** to the queue`
//     }
//     else {
//         await queue.addTrack(result.tracks[0])
//         songContent=`Added **${result.tracks[0].title}** to the queue`
//     }


//     if (!queue.playing) {
//         await queue.play()
//         queue.playing = true

//         const nowplaying = queue.current
//         const progressBar = queue.createProgressBar()
    
//         const row = new ActionRowBuilder()
//             .addComponents(
//                 new ButtonBuilder()
//                     .setCustomId('next')
//                     .setStyle(ButtonStyle.Primary)
//                     .setEmoji('➡️'),
//                 new ButtonBuilder()
//                     .setCustomId('playpause')
//                     .setStyle(ButtonStyle.Primary)
//                     .setEmoji('⏯️')
//             )
    
//         const embed = new EmbedBuilder()
//                             .setColor('0xFFFDD1')
//                             .setTitle(`Currently playing: ${nowplaying.title}`)
//                             .setThumbnail(nowplaying.thumbnail)
//                             .setDescription(`${progressBar}\n\n${nowplaying.url}\n\n**Added by** <@${nowplaying.requestedBy.id}>\nPlaying in ${member.voice.channel.name}`)
//         const reply = await message.reply({
//             content: songContent, 
//             embeds: [embed], 
//             components: [row]
//         })
//         const collector = reply.createMessageComponentCollector()
//         collector.on('collect', async button => {
//             button.deferUpdate()
//             // console.log(button)
//             if(!queue) return
    
//             if(queue && button.customId === 'playpause') await queue.setPaused(!queue.connection.paused)
//             else if(queue && button.customId === 'next') {
//                 if(queue.tracks.length>0) await queue.play()
//                 else await queue.skip()
//             }
//             else return
//         })
//         client.player.addListener('trackEnd', async (e) => {
//             console.log(e)
//             if(e.tracks.length>0) await e.play()
//             else await e.skip()
//             e.playing = true
//         })

//         client.player.addListener('error', async (e) => 
//             console.log('err')
//         )
//     }
//     else{
//         message.reply(songContent)
//     }
// }

// exports.dc = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if (queue) {
//         queue.playing = false
//         queue.clear()
//         queue.destroy()
//     }

//     message.react('☑️')
// }

// exports.skip = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('there are no songs to skip')
//         return
//     }

//     // console.log(queue.tracks)

//     if(queue.tracks.length>0) await queue.play()
//     else await queue.skip()
//     await message.react('➡️')
// }

// exports.shuffle = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('there are no songs to shuffle')
//         return
//     }

//     queue.shuffle()
//     message.react('🔀')
// }

// exports.queue = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }
    
//     const queue = await client.player.getQueue(guild)
//     if(!queue) return

//     // console.log(queue.tracks)
//     if(queue.tracks.length===0) message.reply('queue is empty')
//     else {

//         let totalPages = Math.ceil(queue.tracks.length/10)
//         let currentPage = 1
//         let specialcase=0

//         if(currentPage===totalPages) {
//             specialcase=queue.tracks.length%10
//         }
//         else specialcase=10

//         let kontent = `**Up next**\n`
//         for(let i=1; i<specialcase+1; i++) {
//             kontent += `\`${(currentPage-1)*10+i}\` **|**  ${queue.tracks[(currentPage-1)*10+(i-1)]}\n`
//         }
//         kontent += `\n**Page ${currentPage} of ${totalPages}**`

//         const row = new ActionRowBuilder()
//         .addComponents(
//             new ButtonBuilder()
//                 .setCustomId('previouspage')
//                 .setStyle(ButtonStyle.Primary)
//                 .setEmoji('◀️'),
//             new ButtonBuilder()
//                 .setCustomId('nextpage')
//                 .setStyle(ButtonStyle.Primary)
//                 .setEmoji('▶️')
//         )

//         const embed = new EmbedBuilder()
//                             .setColor('0xFFFDD1')
//                             .setTitle(`🎵 Current queue  |  ${queue.tracks.length} tracks`)
//                             .setDescription(kontent)
//         const reply = await message.reply({embeds: [embed], components: [row]})
//         const collector = reply.createMessageComponentCollector()
//         collector.on('collect', async button => {
//             button.deferUpdate()
//             // console.log(button)
//             if(!queue) return

//             if(queue && button.customId === 'previouspage') {
//                 if(currentPage===1) return
//                 else currentPage--
//             }
//             else if(queue && button.customId === 'nextpage') {
//                 if(currentPage===totalPages) return
//                 else currentPage++
//             }
//             else return

//             kontent=`**Up Next**\n`
//             specialcase=0
//             if(currentPage===totalPages) {
//                 specialcase=queue.tracks.length%10
//             }
//             else specialcase=10

//             for(let i=1; i<specialcase+1; i++) {
//                 kontent += `\`${(currentPage-1)*10+i}\` **|**  ${queue.tracks[(currentPage-1)*10+(i-1)]}\n`
//             }
//             kontent += `\n**Page ${currentPage} of ${totalPages}**`

//             const embed = new EmbedBuilder()
//                 .setColor('0xFFFDD1')
//                 .setTitle(`🎵 Current queue | ${queue.tracks.length} tracks`)
//                 .setDescription(kontent)

//             reply.edit({embeds: [embed]})
//         })
//     }
// }

// exports.nowplaying = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.reply('no songs playing')
//         return
//     }

//     const nowplaying = queue.current
//     const progressBar = queue.createProgressBar()

//     const row = new ActionRowBuilder()
//         .addComponents(
//             new ButtonBuilder()
//                 .setCustomId('next')
//                 .setStyle(ButtonStyle.Primary)
//                 .setEmoji('➡️'),
//             new ButtonBuilder()
//                 .setCustomId('playpause')
//                 .setStyle(ButtonStyle.Primary)
//                 .setEmoji('⏯️')
//         )

//     const embed = new EmbedBuilder()
//                         .setColor('0xFFFDD1')
//                         .setTitle(`Currently playing ${nowplaying.title}`)
//                         .setThumbnail(nowplaying.thumbnail)
//                         .setDescription(`${progressBar}\n\n${nowplaying.url}\n\n**Added by** <@${nowplaying.requestedBy.id}>\nPlaying in ${member.voice.channel.name}`)
//     const reply = await message.reply({embeds: [embed], components: [row]})
//     const collector = reply.createMessageComponentCollector()
//     collector.on('collect', async button => {
//         button.deferUpdate()
//         // console.log(button)
//         if(!queue) return

//         if(queue && button.customId === 'playpause') {
//             console.log(queue.connection.paused)
//             await queue.setPaused(!queue.connection.paused)
//         }
//         else if(queue && button.customId === 'next') {
//             if(queue.tracks.length>0) await queue.play()
//             else await queue.skip()
//         }
//         else return
//     })
// }

// exports.testbutton = async function(message, client) {
//     const row = new ActionRowBuilder()
//     .addComponents(
//         new ButtonBuilder()
//             .setCustomId('next')
//             .setStyle(ButtonStyle.Primary)
//             .setEmoji('➡️'),
//         new ButtonBuilder()
//             .setCustomId('playpause')
//             .setStyle(ButtonStyle.Primary)
//             .setEmoji('⏯️')
//     )
//     const reply = await message.reply({content: 'segs', components: [row]})
//     const collector = reply.createMessageComponentCollector()
//     collector.on('collect', i => console.log(`collected ${i.customId}`));
    
// }

// exports.pause = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('no songs to pause')
//         return
//     }
//     queue.setPaused(true)
//     message.react('⏸️')
// }

// exports.resume = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('no songs to resume')
//         return
//     }
//     queue.setPaused(false)
//     message.react('▶️')
// }

// exports.skipto = async function(message, client, args) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('no queue')
//         return
//     }

//     let originalString=''
//     for(let i=1; i<args.length-1; i++) {
//         originalString = originalString+args[i]+' '
//     }
//     originalString+=args[args.length-1]
//     if(originalString==='skipto' || originalString===' ') return
//     console.log(originalString)

//     if(queue) {
//         queue.skipTo(parseInt(originalString)-1)
//         message.react('➡️')
//     }
//     else return
// }

// exports.clear = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('no queue')
//         return
//     }

//     if(queue) {
//         queue.clear()
//         message.react('👌')
//     }
// }

// exports.playskip = async function(message, client, args) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }

//     let originalString=''
//     for(let i=1; i<args.length-1; i++) {
//         originalString = originalString+args[i]+' '
//     }
//     originalString+=args[args.length-1]
//     if(originalString==='play' || originalString===' ') return
//     console.log(originalString)

//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.reply('you are not in a voice channel')
//         return
//     }

//     let searchEngine = QueryType.AUTO
//     if(originalString.includes('youtube') && !originalString.includes('list'))
//         searchEngine = QueryType.YOUTUBE_VIDEO
//     else if(originalString.includes('spotify') && !originalString.includes('playlist'))
//         searchEngine = QueryType.SPOTIFY_SONG
//     else if(originalString.includes('playlist/')|| (originalString.includes(('list='))))
//         message.reply('you may not use a playlist link with this command')
//     // else message.reply('unknown error')

//     const result = await client.player.search(originalString, {
//         requestedBy: message.author,
//         searchEngine: searchEngine
//     })
    
//     if(result.tracks.length === 0) {
//         message.reply('no results')
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     await queue.insert(result.tracks[0], 0)

//     if(queue.tracks.length>0) await queue.play()
//     else await queue.skip()
//     await message.react('➡️')
// }

// exports.move = async function(message, client, args) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('there are no songs to shuffle')
//         return
//     }
//     args.shift()
//     args[0] = parseInt(args[0])
//     args[1] = parseInt(args[1])
//     if(args.length!=2 
//         || args[0]===NaN 
//         || args[1]===NaN 
//         || args[0]>queue.tracks.length
//         || args[1]>queue.tracks.length) {
//             message.reply('incorrect usage of move command')
//             return
//         } 
            
    
//     if(queue) {
//         let positionFirst = queue.tracks[args[0]-1]
//         let positionSecond = queue.tracks[args[1]-1]
//         queue.tracks[args[0]-1] = positionSecond
//         queue.tracks[args[1]-1] = positionFirst
//         // queue.insert(args[0])
//         message.react('👌')
//     }
//     else return
// }

// exports.move = async function(message, client, args) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('there are no songs to shuffle')
//         return
//     }
//     args.shift()
//     args[0] = parseInt(args[0])

//     if(args[0]===NaN) {
//         message.reply('incorrect usage of move command')
//         return
//     }

//     if(queue) {
//         let positionFirst = queue.tracks[args[0]-1]
//         let positionSecond = queue.tracks[args[1]-1]
//         queue.tracks[args[0]-1] = positionSecond
//         queue.tracks[args[1]-1] = positionFirst
//         // queue.insert(args[0])
//         message.react('👌')
//     }
//     else return
// }

// exports.status = async function(message, client) {
//     if(!message.guildId) {
//         message.reply('you cannot use this command in a dm')
//         return
//     }
//     const guild = client.guilds.cache.get(message.channel.guildId)
//     const member = guild.members.cache.get(message.author.id)

//     if(!member.voice.channel) {
//         message.channel.send("you are not in a voice channel")
//         return
//     }

//     const queue = await client.player.getQueue(guild)
//     if(!queue) {
//         message.channel.send('there are no songs')
//         return
//     }

//     console.log(queue.player)
// }