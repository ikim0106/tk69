const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class EmbedCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'embed',
      group: 'junk',
      memberName: 'embed',
      description: 'Embeds the text you provide.',
    })
  }

  async run(message, args) {
    function sleep(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms)
      })
    }
    const embed = new MessageEmbed()
      .setDescription('ad')
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setColor(0x00AE86)
      .setTimestamp()
      .setTitle(args)
    message.channel.send(embed)
      .then(async function (message) {
        // message.react(message.guild.emojis.find(emoji => emoji.name === "pepedab"))
        // message.react(message.guild.emojis.find(emoji => emoji.name === "HYPERS"))

        await message.react('✅')
        await message.react('❎')

        // const filter = (reaction, user) => reaction.emoji.name === "HYPERS"
        // const collector = message.createReactionCollector(filter, {time: 10000})
        // collector.on('collect', r => r++)
      })
  }
}

module.exports = EmbedCommand