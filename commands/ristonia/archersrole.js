const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class archersrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'archersrole',
      group: 'ristonia',
      memberName: 'archersrole',
      description: 'archersrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Archers")
      .setColor("#FFC0CB")
      .setDescription("Bowmaster: <:Bowmaster:846683378035064862> | Kain: <:Kain:846683377674354688> | Marksman: <:Marksman:846683377306304524> | Mercedes: <:Mercedes:846683377482596413> |  Pathfinder: <:Pathfinder:846683377364762625> | Wild Hunter: <:WildHunter:846683377372626946> | Wind Archer: <:WindArcher:846683377838194698>")
    // const msg = await message.channel.send("bruh")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:Bowmaster:846683378035064862>")
      embedMessage.react("<:Kain:846683377674354688>")
      embedMessage.react("<:Marksman:846683377306304524>")
      embedMessage.react("<:Mercedes:846683377482596413>")
      embedMessage.react("<:Pathfinder:846683377364762625>")
      embedMessage.react("<:WildHunter:846683377372626946>")
      embedMessage.react("<:WindArcher:846683377838194698>")

      const filter = (reaction, user) => {
        return ['Bowmaster', 'Kain', 'Marksman', 'Mercedes', 'Pathfinder', 'WildHunter', 'WindArcher'].includes(reaction.emoji.name) && !user.bot;
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

module.exports = archersrole