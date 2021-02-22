const fs = require('fs')

exports.wf = function (path, inputJson) {
  fs.writeFile(path, inputJson, 'utf8', function (err) {
    if (err) console.log("pepecry", err)
    else console.log(`successfully saved to ${path}`)
  })
}