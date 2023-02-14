const commando = require('discord.js-commando');
class presence extends commando.Command {
  constructor(client) {
      super(client, {
          name: 'presence',
          group: 'junk',
          memberName: 'presence',
          description: 'Sets the Bots\' activity',
          examples: ['Playing __on many servers!__'],
      });
  }
  async run(message, args) {
    if (message.author.id !== "115678953468854279"){
    }
    
    else {
      this.client.user.setPresence({
        status: 'online',
        activity: {
            name: args,
            type: "PLAYING"
        }
    });
    }
  }  
}

module.exports = presence