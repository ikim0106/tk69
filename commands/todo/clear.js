const commando = require('discord.js-commando')

class clear extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      group: 'todo',
      memberName: 'clear',
      description: 'fake clear command',
    })
  }

  async run(message, args) {

  }
}

module.exports = clear