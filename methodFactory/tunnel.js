const ngrok = require('ngrok')
const OAuth = require('./oauth')

class Tunnel extends OAuth {
	constructor(args) {
		super(args)
		const {
			command,
			botConfigs: {
				ngrokToken
			}
		} = args
		this.command = command
		this.ngrokToken = ngrokToken
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