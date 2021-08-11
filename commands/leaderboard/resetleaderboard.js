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
    if(!message.member.hasPermission("MANAGE_MESSAGES")){
      message.reply("u dont have perms for this pepelaf")
    }
    else {
      writeScript.wf('path.resolve(__dirname, "../../userData.json', '')
      message.reply("Leaderboard reset!")
    }
  }
}

module.exports = resetleaderboard