const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class thievesrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'thievesrole',
      group: 'ristonia',
      memberName: 'thievesrole',
      description: 'thievesrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Thieves")
      .setColor("#FFC0CB")
      .setDescription("Cadena: <:Cadena:846683377385734165> | DualBlade: <:DualBlade:846683377729929246> | Hoyoung: <:Hoyoung:846683377507500043> | NightLord: <:NightLord:846683377473421324> | NightWalker: <:NightWalker:846683377478533121> | Phantom: <:Phantom:846683377716953128> | Xenon: <:Xenon:846683377730191390> | Shadower: <:Shadower:846683377699651644>")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:Cadena:846683377385734165>")
      embedMessage.react("<:DualBlade:846683377729929246>")
      embedMessage.react("<:Hoyoung:846683377507500043>")
      embedMessage.react("<:NightLord:846683377473421324>")
      embedMessage.react("<:NightWalker:846683377478533121>")
      embedMessage.react("<:Phantom:846683377716953128>")
      embedMessage.react("<:Xenon:846683377730191390>")
      embedMessage.react("<:Shadower:846683377699651644>")


      const filter = (reaction, user) => {
        return ['Cadena', 'DualBlade', 'Hoyoung', 'NightLord', 'NightWalker', 'Phantom', 'Xenon' ,'Shadower'].includes(reaction.emoji.name) && !user.bot;
      }

      let ApeSquad = message.guild

      const collector = embedMessage.createReactionCollector(filter, {
        dispose: true
      })

      collector.on('collect', async function (reaction, user) {
        let role = ApeSquad.roles.cache.find(role => role.name === reaction._emoji.name)
        let member = ApeSquad.members.cache.get(user.id);
        member.roles.add(role)
        // message.channel.send(`<@${user.id}> reacted with <:${reaction._emoji.name}:${reaction._emoji.id}>`)
      })
      collector.on('remove', async function (reaction, user) {
        let role = ApeSquad.roles.cache.find(role => role.name === reaction._emoji.name)
        let member = ApeSquad.members.cache.get(user.id);
        member.roles.remove(role)
        // message.channel.send(`<@${user.id}> un-reacted with <:${reaction._emoji.name}:${reaction._emoji.id}>`)
      })
    })
  }
}

module.exports = thievesrole