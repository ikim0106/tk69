const commando = require('discord.js-commando')

class autism extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'autism',
      group: 'junk',
      memberName: 'autism',
      description: 'basically nich.exe',
    });
  }

  async run(message, args) {
    function autistic(input) {
      var string = input
      var final = ""
      for (let i = 0; i < string.length; i++) {
        var num = Math.floor((Math.random() * 2) + 1)
        if (num == 1) {
          var a = string[i].toUpperCase()
          final += a
        } else
          final += string[i]
      }
      return final
    }
    message.delete()
    .then(msg => console.log(`Deleted message from ${msg.author.username}, content: ${msg}`))
    .catch(console.error)
    message.channel.send(`<@${message.author.id}>: `+autistic(args))
  }
}

module.exports = autism