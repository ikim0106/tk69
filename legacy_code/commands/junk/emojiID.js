const commando = require('discord.js-commando')

class emojiid extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'emojiid',
      group: 'junk',
      memberName: 'emojiid',
      description: 'replies with the ID of the emoji used',
    });
  }

  async run(message, args) {
    message.reply(`the id for that emoji is: \\${args}`)
  }
}

module.exports = emojiid