const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events 
} = require("discord.js")
const yts = require('yt-search')
const ytdl = require('ytdl-core')
const { StreamType, getVoiceConnection, createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice')

exports.play = async function(message, client, args) {
    const guild = client.guilds.cache.get(message.channel.guildId)
    const member = guild.members.cache.get(message.author.id)

    if(!member.voice.channel) {
        message.reply('you are not in a voice channel')
        return
    }

    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    })
    
    let string = args.join(' ')
    console.log(string)

    if(!client.player.musicQueues.get(guild.id)) {
        client.player.musicQueues.set(guild.id, [])
    }
    console.log(client.player.musicQueues)

    if(ytdl.validateURL(args[0])) {
        client.player.musicQueues.get(guild.id).push(args[0])
        // song = ytdl.downloadFromInfo(songInfo, {
        //     filter: 'audioonly'
        // })
    } else {
        const {videos} = await yts(string)
        if (!videos.length) return message.channel.send("No songs were found!")
        client.player.musicQueues.get(guild.id).push(videos[0].url)
        // song = ytdl(videos[0].url, {
        //     filter: 'audioonly'
        // })
    }

    // console.log(client.player.musicQueues)
    // return
    
    // let fetchedAudioPlayer = getVoiceConnection(guild.id)
    // let track = createAudioResource(song, {
    //     inlineVolume: false,
    //     // inputType: StreamType.Opus,
    // })
    connection.subscribe(client.player)
    
    if(client.player._state.status==='idle') {
        let trackURL = ytdl(client.player.musicQueues.get(guild.id)[0], {
            filter: 'audioonly'
        })
        let track = createAudioResource(trackURL, {
            inlineVolume: false,
            // inputType: StreamType.Opus,
        })
        client.player.musicQueues.get(guild.id).shift()
        client.player.play(track)
        client.player.addListener('stateChange', (e) => {
            console.log(client.player._state.status)
            if(client.player._state.status === 'idle' && client.player.musicQueues.get(guild.id).length) {
                let trackURL = ytdl(client.player.musicQueues.get(guild.id).shift(), {
                    filter: 'audioonly'
                })
                let track = createAudioResource(trackURL, {
                    inlineVolume: false,
                    // inputType: StreamType.Opus,
                })
                client.player.play(track)
            }
        }) 
    }
    // else {
    //     client.player.musicQueues.get(guild.id).push(track)
    // }

    // console.log(client.player)
}

exports.playstatus = async function(message, client) {
    const guild = client.guilds.cache.get(message.channel.guildId)
    const member = guild.members.cache.get(message.author.id)

    if(!member.voice.channel) {
        message.reply('you are not in a voice channel')
        return
    }

    console.log(client.player)
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