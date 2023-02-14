const commando = require('discord.js-commando')
const ms = require('ms')
const {
    MessageEmbed
  } = require('discord.js')

function shuffle(array) {
    var i = array.length,
    j = 0,
    temp;

while (i--) {

    j = Math.floor(Math.random() * (i+1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;

}

return array;
}

class giveaway extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            group: 'ristonia',  
            memberName: 'giveaway',
            description: 'giveaway',
        })
    }

    async run(message, args) {
        message.delete()

        let stuff = args.split(' ')
        
        let rewardArr = stuff[0].split('_')
        let reward = ''
        for(var n =0; n<rewardArr.length; n++) {
            reward+=' '
            reward+=rewardArr[n]
        }
        let duration = parseInt(stuff[1])
        let noOfWinners = parseInt(stuff[2])
        let host = stuff[3]
        let kekhours
        let kekminutes
        let kekdays

        var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor((duration / (1000 * 60 * 60 * 24)))

        if(hours==1) kekhours = `${hours} hour`
        else kekhours = `${hours} hours`
        if(minutes==1) kekminutes = `${minutes} minute`
        else kekminutes = `${minutes} minutes`
        if(days==1) kekdays = `${days} day`
        else kekdays = `${days} days`

        let footer1;

        if (noOfWinners===1)
            footer1 = `${noOfWinners} winner`
        else
            footer1 = `${noOfWinners} winners`

        const msg = new MessageEmbed()
            .setTitle(reward)
            .setDescription(`React with <a:mushroom:845192816304062464> to enter the giveaway!\nTime remaining: ${kekdays}, ${kekhours}, ${kekminutes}.\nHost: ${host}`)
            .setFooter(footer1)
            .setColor("#FFC0CB")

        message.channel.send(`<a:mushroom:845192816304062464> GIVEAWAY <a:mushroom:845192816304062464>`,{
            embed: msg
        }).then(embedMessage => {
            embedMessage.react("<a:mushroom:845192816304062464>")
            
        let kekw = setInterval(() => {
            duration-=60000
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor(duration / (1000 * 60 * 60 * 24))

            if(hours==1) kekhours = `${hours} hour`
            else kekhours = `${hours} hours`

            if(minutes==1) kekminutes = `${minutes} minute`
            else kekminutes = `${minutes} minutes`

            if(days==1) kekdays = `${days} day`
            else kekdays = `${days} days`

            if(duration<=60000) clearInterval(kekw)
            else{
            const msg2 = new MessageEmbed()
                .setTitle(reward)
                .setDescription(`React with <a:mushroom:845192816304062464> to enter the giveaway!\nTime remaining: ${kekdays}, ${kekhours}, ${kekminutes}\nHost: ${host}`)
                .setFooter(footer1)
                .setColor("#FFC0CB")
            embedMessage.edit(msg2)
            }
        }, 60000)
        


            
        const filter = (reaction, user) => {
            return ['mushroom', 'shadedumb'].includes(reaction.emoji.name) && !user.bot;
        }

        let ApeSquad = message.guild

        const collector = embedMessage.createReactionCollector(filter, {
            time: duration
        })

        collector.on('collect', async function (reaction, user) {
            let member = ApeSquad.members.cache.get(user.id)
            if(member.hasPermission('MANAGE_MESSAGES') && reaction._emoji.name == 'shadedumb'){
                reaction.remove()
                duration=500
                collector.stop()
            }
            else console.log("wrong reaction or doesn't have perms")
          })

        collector.on('end', async function (collected, reason) {
            let users = collected.array()[0].users.cache.array()
            // console.log(users)

            let indexOfUwUbot=0;
            for(let p =0; p<users.length; p++) {
                if (users[p].bot==true) indexOfUwUbot=p
            }
            if(indexOfUwUbot>-1){
                users.splice(indexOfUwUbot, 1)
            }

            let randNums = shuffle(users)
            
            if(randNums.length<noOfWinners) message.channel.send("Not enough people participated in this giveaway, therefore this giveaway has been canceled")
            else {
                let announceMsg;
                if(noOfWinners==1) announceMsg=`${reward} giveaway winner: `
                else announceMsg=`${reward} giveaway winners: `

                for(let q = 0; q<noOfWinners; q++) {
                    announceMsg+=`${randNums[q]} `
                }
                announceMsg+='Congratulations! <a:mushroom:845192816304062464>'
                message.channel.send(announceMsg)



            const edited = new MessageEmbed()
                .setTitle(reward)
                .setDescription(`Giveaway has ended!`)
                .setFooter(footer1)

            embedMessage.edit(edited)
            }
          })
        })
    }
}

module.exports = giveaway