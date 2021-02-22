const commando = require('discord.js-commando')
let request = require("request")
let convert = require('xml-js')

class rule34 extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'rule34',
      group: 'search',
      memberName: 'rule34',
      description: 'display one random image out of the rule34 library (nsfw alert), simple filtering for posts with bad score does exist',
    })
  }

  async run(message, args) {
    if (args.toLowerCase()==='kda'||args.toLowerCase()==='k/da')
    {
      args='k/da_series'
    }

    function filterPosts(arr) {
      let newarr = []
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]._attributes.score > 5)
          newarr.push(arr[i])
      }
      // console.log(newarr)
      return newarr
    }

    function lookForNasty(post) {
      let tags = []
      let nastyTags=['guro','gore','young','child','children','amputee','homosexual','gay','shemale','futa','futanari']
      if(!post._attributes.tags) return null
      else console.log(post._attributes.tags)

      for(let p=0; p<nastyTags.length; p++)
      {
        if(post._attributes.tags.includes(nastyTags[p]))
        {
          tags.push(nastyTags[p])
        }
      }

      console.log(tags)
      return tags
    }

    request('https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=' + args,
      function (error, response, body) {
        var data, error, unparsedJSON
        try {
          unparsedJSON = convert.xml2json(body, {compact: true, spaces: 2})
          data = JSON.parse(unparsedJSON)
        } catch (error) {
          console.log(error)
          message.channel.send('Unknown error occured, tell troll kim to fix his shit')
          return
        }
        if (!data) {
          console.log(data);
          message.channel.send("Error:\n" + JSON.stringify(data))
          return
        } else if (data.posts._attributes.count < 1) {
          console.log(data)
          message.channel.send("No result for '" + args + "'")
          return
        }
        let tempPosts = data.posts.post
        let filteredPosts = filterPosts(tempPosts)
        let randomNumber = Math.floor(Math.random() * (filteredPosts.length))
        if (filteredPosts.length > 50) randomNumber = Math.floor(Math.random() * 50)
        var result = filteredPosts[randomNumber]
        console.log('result ', result)
        if(!result)
          message.channel.send(`No results for '${args}'`)
        else {
          let nastyTagsArray = lookForNasty(result)
          if(nastyTagsArray.length!=0){
            let tagsList=''
            for(let i=0;i<nastyTagsArray.length; i++)
            {
              tagsList+=nastyTagsArray[i]+', '  
            }

            // tagsList.replace('undefined','')
            message.channel.send('Score: ' + result._attributes.score + '\n' + `|| ${result._attributes.file_url} ||`+ `\nThis image has been censored by a spoiler due to the following tag(s): ${tagsList.substring(0,tagsList.length-2)}`)
          } 
          else
          {
            message.channel.send('Score: ' + result._attributes.score + '\n' + result._attributes.file_url)

          }
        }
      })
  }
}

module.exports = rule34