const ngrok = require('ngrok')

class Tunnel {
	constructor({
		command,
		botServer,
		chatId,
		botConfigs: {
			ngrokToken
		},
		log
	}) {
		this.command = command
		this.botServer = botServer
		this.chatId = chatId
		this.ngrokToken = ngrokToken
		this.log = log
	}

	async executeMethod() {
		if (this.command === 'on') {
			const url = await ngrok.connect({ authtoken: this.ngrokToken })
			this.botServer.sendMessage(this.chatId, `Here it goes your tunnel url: ${url}`)
		} else if (this.command === 'off') {
			await ngrok.disconnect()
			await ngrok.kill()
			this.botServer.sendMessage(this.chatId, 'Tunnel is gone!')
		} else {
			this.botServer.sendMessage(this.chatId, `Command '${this.command}' not mapped...`)
		}
	}
}

module.exports = Tunnel