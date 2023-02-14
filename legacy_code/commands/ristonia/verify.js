// const commando = require('discord.js-commando')

// class verify extends commando.Command {
//   constructor(client) {
//     super(client, {
//       name: 'verify',
//       group: 'ristonia',
//       memberName: 'verify',
//       description: 'verifies members in the Rice discord',
//     });
//   }

//   async run(message, args) {
//     if (!args) message.reply("Wrong usage of the !verify command, try agin!");
//     else {

//       let riceDiscord = message.guild
//       let generalChannel = riceDiscord.channels.cache.get("812000499510935555")
//       let memberRole = riceDiscord.roles.cache.get("812367604400390175")
//       if (message.channel.id != "812659335925596200") {
//         message.reply("You may not use that command in this channel")
//       } else {
//         message.member.setNickname(args)
//         message.member.roles.set(["812367604400390175"])
//         message.delete()
//         generalChannel.send(`<@${message.author.id}> You have been verified! Welcome to Rice! <:riceball:812010897421107201>`)
//       }
//     }
//   }
// }

// module.exports = verify



//defunct command