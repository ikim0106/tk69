const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class piratesrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'piratesrole',
      group: 'ristonia',
      memberName: 'piratesrole',
      description: 'piratesrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Pirates")
      .setColor("#FFC0CB")
      .setDescription("Angelic Buster: <:AngelicBuster:846683377683005510> | Ark: <:Ark:846683377709219850> | Buccaneer: <:Buccaneer:846683377645780992> | Cannoneer: <:Cannoneer:846683377683922974> | Corsair: <:Corsair:846683377716822076> | Jett: <:Jett:846683377682612254> | Mechanic: <:Mechanic:846683378069012540> | ThunderBreaker: <:ThunderBreaker:846683377732943872> | Shade: <:Shade:846683377809883156>")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:AngelicBuster:846683377683005510>")
      embedMessage.react("<:Ark:846683377709219850>")
      embedMessage.react("<:Buccaneer:846683377645780992>")
      embedMessage.react("<:Cannoneer:846683377683922974>")
      embedMessage.react("<:Corsair:846683377716822076>")
      embedMessage.react("<:Jett:846683377682612254>")
      embedMessage.react("<:Mechanic:846683378069012540>")
      embedMessage.react("<:ThunderBreaker:846683377732943872>")
      embedMessage.react("<:Shade:846683377809883156>")


      const filter = (reaction, user) => {
        return ['AngelicBuster', 'Ark', 'Buccaneer', 'Cannoneer', 'Corsair', 'Jett', 'Mechanic' ,'ThunderBreaker', 'Shade'].includes(reaction.emoji.name) && !user.bot;
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

module.exports = piratesrole