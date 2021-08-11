exports.printList = function (message, inputArray) {
  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }
  let list = inputArray.splice(1,inputArray.length)
  console.log('list length', list.length)

  let totalPages = Math.ceil(list.length / 10)
  let pageNumber = 1
  let numberList = []

  async function reactArrows(message) {
    await message.react('⬅')
    await message.react('➡')
  }

  function returnFinalPrint(pageNumber) {
    let finalPrint = `Showing list for <@${inputArray[0]}>\n\`\`\``
    if (list.length > 10) {
      for (let i = (pageNumber * 10) - 10; i < (pageNumber * 10); i++) {
        if (`${i+1}`.toString().length === 1) {
          if (list[i]) {
            numberList.push(i)
            finalPrint += '' + `${i+1}` + '.  ' + `${list[i]}\n`
          } else finalPrint += '\n'
        } else {
          if (list[i]) {
            numberList.push(i)
            finalPrint += '' + `${i+1}` + '. ' + `${list[i]}\n`
          } else finalPrint += '\n'

        }
      }
      finalPrint += '```'
      finalPrint += `Displaying entries **${pageNumber*10-9}** to **${numberList[numberList.length-1]+1}** out of **${list.length}** entries\n`
      finalPrint += `You are currently viewing page **${pageNumber}** out of **${totalPages}**\nThis list will expire in **5 minutes**`
    } else {
      for (let i = 0; i < list.length; i++) {
        if (`${i+1}`.toString().length === 1) {
          if (list[i]) {
            finalPrint += '' + `${i+1}` + '.  ' + `${list[i]}\n`
          } else finalPrint += '\n'
        } else {
          if (list[i]) {
            finalPrint += '' + `${i+1}` + '. ' + `${list[i]}\n`
          } else finalPrint += '\n'
        }
      }
      finalPrint += '```'
      finalPrint += `Displaying entries **1** to **${list.length}** out of **${list.length}** entries\n`
      finalPrint += `You are currently viewing page **1** out of **1** page\nThis list will expire in **5 minutes**`
    }
    return finalPrint
  }
  message.channel.send(returnFinalPrint(pageNumber))
    .then(async function (message) {
      reactArrows(message)
      const filter = (reaction, user) => (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && (!user.bot)
      const collector = message.createReactionCollector(filter, {
        time: 300000
      })
      collector.on('collect', async function (r) {
        if (r.emoji.name === '➡') {
          message.reactions.removeAll()
          pageNumber++
          await sleep(100)
          if (pageNumber <= totalPages) {
            message.edit(returnFinalPrint(pageNumber))
              .catch(console.error)
            reactArrows(message)
          } else {
            pageNumber--
            message.channel.send('This is the last page').then(msg => msg.delete(3000))
            reactArrows(message)
          }
        }
        if (r.emoji.name === '⬅') {
          message.reactions.removeAll()
          pageNumber--
          await sleep(100)
          if (pageNumber > 0) {
            message.edit(returnFinalPrint(pageNumber))
              .catch(console.error)
            reactArrows(message)
          } else {
            pageNumber++
            message.channel.send('This is the first page').then(msg => msg.delete(3000))
            reactArrows(message)
          }
        }
      })
      collector.on('end', function () {
        message.edit(`${message.content.replace('This list will expire in **5 minutes**', 'This list has **expired**')}`)
      })
    })
}