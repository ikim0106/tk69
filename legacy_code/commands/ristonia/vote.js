const commando = require('discord.js-commando')

class vote extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'vote',
      group: 'ristonia',
      memberName: 'vote',
      description: 'generates a vote link for gtop100 RistoniaMS',
    });
  }

  async run(message, args) {
    message.reply(`Vote for Ristonia here!\nhttps://gtop100.com/topsites/MapleStory/sitedetails/Ristonia--98344?vote=1&pingUsername=${args}`)
  }
}

module.exports = vote