const commando = require('discord.js-commando')
let request = require("request")
let auth = require("../../auth.json")

class ImageSearch extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'image',
      group: 'search',
      memberName: 'image',
      description: 'display one random Google image out of the top 10',
    })
  }

  async run(message, args) {
    if (!auth || !auth.googleAPIKey) {
      message.channel.sendMessage("Image search requires a Google Custom Search key.")
      return
    }
    request('https://www.googleapis.com/customsearch/v1?key='+auth.googleAPIKey+'&cx='+auth.googleEngineID+'&q='+args+'&searchType=image',
      function (error, response, body) {
        var data, error
        try {
          data = JSON.parse(body)
        } catch (error) {
          console.log(error)
          return
        }
        if (!data) {
          console.log(data)
          message.channel.send("Error:\n" + JSON.stringify(data))
          return
        } else if (!data.items || data.items.length == 0) {
          console.log(data)
          message.channel.send("No result for '" + args + "'")
          return;
        }
        let randomNumber = Math.floor(Math.random()*10+1)
        var result = data.items[randomNumber]
        if(!result)
          message.channel.send('Error, try again')
        else
          message.channel.send(result.link)
      })
  }
}

module.exports = ImageSearch