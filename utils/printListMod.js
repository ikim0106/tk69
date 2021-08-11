//same as printlist but modified for flag

exports.printListMod = function (message, inputArray) {
  let list = inputArray

  async function reactArrows(message) {
    await message.react('⬅')
    await message.react('➡')
  }

  function returnFinalPrint() {
    let finalPrint = `**Flag Leaderboard**\n\`\`\``
    for(let i =0; i<inputArray.length; i++) {
      let pepelaf = `${list[i][0]}`
      var pad = 25-list[i][0].length
      for(let q = 0; q< pad; q++) pepelaf+= ' '
      pepelaf+= `${list[i][1]} points`
      finalPrint += '' + `${i+1}` + '.  ' + `${pepelaf}\n`
    }
    finalPrint+=`\`\`\``
    return finalPrint
  }

  message.channel.send(returnFinalPrint())
}