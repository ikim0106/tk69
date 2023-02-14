const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class giveawayrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'giveawayrole',
      group: 'ristonia',
      memberName: 'giveawayrole',
      description: 'giveawayrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Giveaway role")
      .setColor("#FFC0CB")
      .setDescription("React with <:catto:847135702504177674> to be pinged for giveaways")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:catto:847135702504177674>")


      const filter = (reaction, user) => {
        return ['catto'].includes(reaction.emoji.name) && !user.bot;
      }

      let ApeSquad = message.guild

      const collector = embedMessage.createReactionCollector(filter, {
        dispose: true
      })

      collector.on('collect', async function (reaction, user) {
        let role = ApeSquad.roles.cache.find(role => role.name === 'Giveaways')
        let member = ApeSquad.members.cache.get(user.id);
        member.roles.add(role)
        // message.channel.send(`<@${user.id}> reacted with <:${reaction._emoji.name}:${reaction._emoji.id}>`)
      })
      collector.on('remove', async function (reaction, user) {
        let role = ApeSquad.roles.cache.find(role => role.name === 'Giveaways')
        let member = ApeSquad.members.cache.get(user.id);
        member.roles.remove(role)
        // message.channel.send(`<@${user.id}> un-reacted with <:${reaction._emoji.name}:${reaction._emoji.id}>`)
      })
    })
  }
}

module.exports = giveawayrole