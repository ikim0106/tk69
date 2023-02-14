const commando = require('discord.js-commando')
const fs = require('fs')
const path = require('path')
let modifiedPrintList = require('../../utils/printListMod')

class leaderboard extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      group: 'leaderboard',
      memberName: 'leaderboard',
      description: 'shows flag entry leaderboard',
    });
  }

  async run(message) {
    let processedData=[]
    let noOfEntries = []
    let file = fs.readFileSync(path.resolve(__dirname, "../../userData.json"), 'utf-8')
    if(file=='') message.reply("No leaderboard entries to show")
    else{
      let rawdata = JSON.parse(file)
      // console.log(rawdata[0])
      
      for(let i=0; i<rawdata.length; i++) {
        let someShit = []
        
        let moonDiscord = message.guild
        let moonMember = await moonDiscord.members.fetch(rawdata[i][0])
        let moonNickname = moonMember.nickname
        if (moonNickname==null) {
          moonNickname = moonMember.user.username
        }
        else {
          moonNickname = moonNickname.split('|')[0].trim()
          if (moonNickname==null) {
            message.reply("you have the wrong nickname format pepelaf")
          }
        }
        someShit.push(moonNickname)
        
        let totPts=0
        for(let q =1; q<rawdata[i].length; q++) {
          totPts+=parseInt(rawdata[i][q])
        }
        someShit.push(totPts)
        noOfEntries.push(rawdata[i].length-1)
        
        // console.log(someShit)
        processedData.push(someShit)
      }
      
      if(!message.member.hasPermission("MANAGE_MESSAGES") && !message.member.roles.cache.has('877585031449677875')){
        message.reply("u dont have perms for this pepelaf")
      } 
      else {
        let len = processedData.length
        for(let i=0; i<len; i++) {
          let min = i;
          for(let j = i+1; j<len; j++) {
            if(processedData[j][1] < processedData[min][1]) {
              min = j;
            }
          }
          
          if(min!=i) {
            let tmp = processedData[i]
            processedData[i] = processedData[min]
            processedData[min] = tmp
          }
        }
        processedData.reverse()
        console.log("asd", noOfEntries)
        
        modifiedPrintList.printListMod(message, processedData, noOfEntries)
        processedData=[]
      }
    }
  }

}
  
  module.exports = leaderboard
  