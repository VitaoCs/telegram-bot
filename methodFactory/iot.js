const fs = require('fs')
const axios = require('axios')

class Iot {
	constructor({
		command,
		botServer,
		chatId,
		botConfigs: {
			config: {
				iot 
			}
		},
		log
	}) {
		this.command = command
		this.botServer = botServer
		this.chatId = chatId
		this.iot = iot
		this.log = log
	}

	async executeMethod() {
		if (this.command === 'cam') {
			console.log('Taking a picture...')
			const picture = await axios.get(`${this.iot.esp32cam}/cam-hi.jpg`, {
				responseType: 'stream',
			})

			await picture.data.pipe(fs.createWriteStream('./picture.jpg'))
			await new Promise((resolve) => setTimeout(resolve, 7000))
			this.botServer.sendPhoto(this.chatId, './picture.jpg')
		} else {
			this.botServer.sendMessage(this.chatId, `Command '${this.command}' not mapped...`)
		}
	}
}

module.exports = Iot