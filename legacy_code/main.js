let auth = require('../auth.json')
let pl = require('../utils/printList')
let writeScript = require('../utils/writeFile')
const fs = require('fs')
let data = []

try {
	if (fs.existsSync('./userData.json')) {
		let rawdata = fs.readFileSync('./userData.json', 'utf-8')
		if (rawdata === '') data = []
		else {
			data = JSON.parse(rawdata)
		}
	} else {
		fs.writeFile('./userData.json', '')
	}
} catch (err) {
	console.error(err)
}

console.log('loaded from userData.json', data)

const commando = require('discord.js-commando')
const intents = ["GUILDS", "GUILD_MEMBERS"]
const bot = new commando.Client({
	owner: auth.ownerID,
	commandPrefix: '='
})
const {
	isNumber
} = require('util')

//var json = JSON.parse(auth.token);
console.log('token', auth.token)

bot.on('message', (message) => {
	if (message.content == 'ping') {
		message.channel.send('pong')
	} else if (message.content.toLowerCase().includes('penis')) {
		message.channel.send(':b:enis')
	}
})

bot.on('message', (message) => {
	try {
		if (fs.existsSync('./userData.json')) {
			let rawdata = fs.readFileSync('./userData.json', 'utf-8')
			if (rawdata === '') data = []
			else {
				data = JSON.parse(rawdata)
			}
		} else {
			fs.writeFile('./userData.json', '')
		}
	} catch (err) {
		console.error(err)
	}
	if (message.content.toLowerCase().startsWith('=add ')) {
		let item = message.content.replace('=add ', '')
		let isnum = /^\d+$/.test(item)
		if (isnum && Number(item <= 100) && Number(item >= 10)) {
			let userData = [message.author.id, item]
			if (data.length == 0) {
				data.push(userData)
				message.react("<:pepeOK:825037688402214943>")
				writeScript.wf('./userData.json', JSON.stringify(data))
			} else {
				let counter = 0
				for (let i = 0; i < data.length; i++) {
					if (data[i][0] == message.author.id) {
						console.log('list exists')
						data[i].push(item)
						counter++
						message.react("<:pepeOK:825037688402214943>")
						writeScript.wf('./userData.json', JSON.stringify(data))
						break
					}
				}
				if (counter == 0) {
					data.push(userData)
					message.react("<:pepeOK:825037688402214943>")
					writeScript.wf('./userData.json', JSON.stringify(data))
				}
			}
			console.log(data)
		} else {
			message.reply("Invalid input")
		}
	}
	if (message.content.toLowerCase().startsWith('=resetleaderboard')) {
		data = []
		writeScript.wf('./userData.json', '')
	}
	if (message.content.toLowerCase().startsWith('=remove ')) {
		let index = parseInt(message.content.replace('=remove ', ''))
		if (data.length == 0) {
			message.channel.send('There is nothing to remove!')
		} else {
			let counter = 0
			for (let i = 0; i < data.length; i++) {

				if (data[i].length == 1) {
					message.channel.send('You have nothing in your list to remove!')
					break
				} else if ((data[i][0] == message.author.id)) {
					data[i].splice(index, 1)
					counter++
					message.channel.send(`Successfully removed!`)
					writeScript.wf('./userData.json', JSON.stringify(data))
					break
				}
			}
			if (counter == 0) {
				message.channel.send('Incorrect usage of the remove command')
			}
		}
		console.log(data)
	}
	if (message.content.toLowerCase().startsWith('=list')) {
		if (data.length == 0) {
			message.channel.send('You have nothing in your list!')
		}

		for (let i = 0; i < data.length; i++) {
			if (data[i].length == 1) {
				message.channel.send('You have nothing in your list!')
			} else if (data[i][0] == message.author.id) {
				pl.printList(message, data[i])
			}
		}
		let rawdata = fs.readFileSync('./userData.json', 'utf-8')
		if (rawdata === '') data = []
		else {
			data = JSON.parse(rawdata)
		}
	}

})

bot.login(auth.token)