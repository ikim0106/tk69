//same as printlist but modified for flag

exports.printListModCount = function (message, inputArray) {
  let list = inputArray

  function returnFinalPrint() {
    let finalPrint = `**Flag Entries**\n\`\`\``
    for(let i =0; i<list.length; i++) {
      let pepelaf = `${list[i][0]}`
      let pad
      if (i<9) pad = 15-list[i][0].length
      else pad = 14-list[i][0].length
      for(let q = 0; q< pad; q++) pepelaf+= ' '
      pepelaf+= `${list[i][1]}`
      finalPrint += '' + `${i+1}` + '. ' + `${pepelaf}\n`

      // if(pepe>0&&pepe<100) finalPrint+=`          ${noOfEntries[i]} entries`
      // else if (pepe>100&&pepe<1000) finalPrint+=`         ${noOfEntries[i]} entries`
    }
    finalPrint+=`\`\`\``
    return finalPrint
  }

  message.channel.send(returnFinalPrint())
}