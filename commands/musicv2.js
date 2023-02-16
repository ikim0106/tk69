// const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require("discord.js")
// const { QueryType } = require("discord-player")

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
//     if(!client.player.queuesCustom.has(guild.id)) {
//         client.player.queuesCustom.set(guild.id, [])
//         console.log(client.player.queuesCustom)
//     }
//     client.player.voiceUtils.join(member.voice.channel, {deaf: true, maxTime: 69})
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
//         client.player.queuesCustom.get(guild.id).push(...result.tracks)
//         songContent=`Added **${result.tracks.length} tracks** to the queue`
//         console.log(client.player.queuesCustom.get(guild.id))
//     }
//     else {
//         client.player.queuesCustom.get(guild.id).push(result.tracks[0])
//         songContent=`Added **${result.tracks[0].title}** to the queue`
//         console.log(client.player.queuesCustom.get(guild.id))
//     }

//     console.log(client.player)
// }