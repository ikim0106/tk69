const commando = require('discord.js-commando')

class add extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'add',
      group: 'todo',
      memberName: 'add',
      description: 'fake add command',
    })
  }

  async run(message, args) {

  }
}

module.exports = add