const commando = require('discord.js-commando')

class list extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'list',
      group: 'todo',
      memberName: 'list',
      description: 'fake list command',
    })
  }

  async run(message, args) {

  }
}

module.exports = list