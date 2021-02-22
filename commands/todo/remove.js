const commando = require('discord.js-commando')

class remove extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      group: 'todo',
      memberName: 'remove',
      description: 'fake remove command',
    })
  }

  async run(message, args) {

  }
}

module.exports = remove