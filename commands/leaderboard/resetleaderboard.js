const commando = require('discord.js-commando')
let writeScript = require('../../utils/writeFile')
const path = require("path")

class resetleaderboard extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'resetleaderboard',
      group: 'leaderboard',
      memberName: 'resetleaderboard',
      description: 'resetleaderboard',
    });
  }

  async run(message) {
    writeScript.wf('path.resolve(__dirname, "../../userData.json', '')
    message.reply("Leaderboard reset!")
  }
}

module.exports = resetleaderboard