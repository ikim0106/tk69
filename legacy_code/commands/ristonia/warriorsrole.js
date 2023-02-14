const commando = require('discord.js-commando')
const {
  MessageEmbed
} = require('discord.js')

class warriorsrole extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'warriorsrole',
      group: 'ristonia',
      memberName: 'warriorsrole',
      description: 'warriorsrole',
    });
  }

  async run(message, args) {
    message.delete()
    const msg = new MessageEmbed()
      .setTitle("Warriors")
      .setColor("#FFC0CB")
      .setDescription("Adele: <:Adele:846683377440260117> | Aran: <:Aran:846683377284677693> | Blaster: <:Blaster:846683377440522241> | Dark Knight: <:DarkKnight:846683377636737044> |  Dawn Warrior: <:DawnWarrior:846683377653776404> | Demon Avenger: <:DemonAvenger:846683377339334697> | Demon Slayer: <:DemonSlayer:846683377628610610> | Hayato: <:Hayato:846683377397530635> | Hero: <:Hero:846683377549049917> | Kaiser: <:Kaiser:846683377650106370> | Mihile: <:Mihile:846683377687330826> | Paladin: <:Paladin:846683377683005460> | Zero: <:Zero:846683377741987850>")
    // const msg = await message.channel.send("bruh")
    message.channel.send({
      embed: msg
    }).then(embedMessage => {
      embedMessage.react("<:Adele:846683377440260117>")
      embedMessage.react("<:Aran:846683377284677693>")
      embedMessage.react("<:Blaster:846683377440522241>")
      embedMessage.react("<:DarkKnight:846683377636737044>")
      embedMessage.react("<:DawnWarrior:846683377653776404>")
      embedMessage.react("<:DemonAvenger:846683377339334697>")
      embedMessage.react("<:DemonSlayer:846683377628610610>")
      embedMessage.react("<:Hayato:846683377397530635>")
      embedMessage.react("<:Hero:846683377549049917>")
      embedMessage.react("<:Kaiser:846683377650106370>")
      embedMessage.react("<:Mihile:846683377687330826>")
      embedMessage.react("<:Paladin:846683377683005460>")
      embedMessage.react("<:Zero:846683377741987850>")

      const filter = (reaction, user) => {
        return ['Adele', 'Aran', 'Blaster', 'DarkKnight', 'DawnWarrior', 'DemonSlayer', 'DemonAvenger', 'Hayato', 'Hero', 'Kaiser', 'Mihile', 'Paladin', 'Zero'].includes(reaction.emoji.name) && !user.bot;
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

module.exports = warriorsrole