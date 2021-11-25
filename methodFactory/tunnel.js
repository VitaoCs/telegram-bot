const ngrok = require('ngrok')
const OAuth = require('./oauth')
const { HTML_SMALLER, HTML_GREATER } = require('../utils/constants')

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

	help() {
		this.botServer.sendMessage(this.chatId, `
				<b>This command allow to create a tunnel on the server.</b>
				\n Use the following command to open the tunnel:
				<code>/tunnel ${HTML_SMALLER}on${HTML_GREATER}</code>
				\n Use the following command to close the tunnel:
				<code>/tunnel ${HTML_SMALLER}off${HTML_GREATER}</code>
			`, { parse_mode: 'HTML' })
	}
}

module.exports = Tunnel