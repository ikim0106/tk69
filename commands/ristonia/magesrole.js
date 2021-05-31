const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class magesrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'magesrole',
      group: 'ristonia',
      memberName: 'magesrole',
      description: 'magesrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Magicians")
      .setColor("#FFC0CB")
      .setDescription("Battle Mage: <:BattleMage:846683377624023081> | Beast Tamer: <:BeastTamer:846683377599512616> | Bishop: <:Bishop:846683377633591296> | BlazeWizard: <:BlazeWizard:846683377717346304> | Evan: <:Evan:846683377645912074> | Fire Poison: <:FirePoison:846683377671471104> | Ice Lightning: <:IceLightning:846683377608163329> | Illium: <:Illium:846683377738317824> | Kanna: <:Kanna:846683377703583805> | Kinesis: <:Kinesis:846683377679597588> | Luminous: <:Luminous:846683377935712266>")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:BattleMage:846683377624023081>")
      embedMessage.react("<:BeastTamer:846683377599512616>")
      embedMessage.react("<:Bishop:846683377633591296>")
      embedMessage.react("<:BlazeWizard:846683377717346304>")
      embedMessage.react("<:Evan:846683377645912074>")
      embedMessage.react("<:FirePoison:846683377671471104>")
      embedMessage.react("<:IceLightning:846683377608163329>")
      embedMessage.react("<:Illium:846683377738317824>")
      embedMessage.react("<:Kanna:846683377703583805>")
      embedMessage.react("<:Kinesis:846683377679597588>")
      embedMessage.react("<:Luminous:846683377935712266>")


      const filter = (reaction, user) => {
        return ['BattleMage', 'BeastTamer', 'Bishop', 'BlazeWizard', 'Evan', 'FirePoison', 'IceLightning' ,'Illium', 'Kanna', 'Kinesis', 'Luminous'].includes(reaction.emoji.name) && !user.bot;
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

module.exports = magesrole