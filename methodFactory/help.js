const OAuth = require('./oauth')
const configure = require('./configure')
const shell = require('./shell')
const iot = require('./iot')
const tunnel = require('./tunnel')
const bank = require('./bank')
const { HTML_SMALLER, HTML_GREATER } = require('../utils/constants')
const methods = { shell, iot, tunnel, configure, bank }

class Help extends OAuth {
	constructor(args) {
		super(args)
		const { command } = args
		this.command = command
		this.argsUsed = args
	}

	helpFactory (value) {
		const Method = methods[value]
		if (!Method) return false
		return new Method(this.argsUsed)
	}

	executeMethod() {
		const methodHelper = this.helpFactory(this.command)
		if(this.command === 'admin') return this.adminInfo()
		if(!methodHelper) return this.botServer.sendMessage(this.chatId, `
			You can perform the following bot commands: shell, iot, tunnel, configure, bank, admin.\n
			Use the following command for more information:
			<code>/help ${HTML_SMALLER}command${HTML_GREATER}</code>
		`, { parse_mode: 'HTML' })
		methodHelper.help()
	}

	// Override
	validateOAuth(msg, match) {
		if (!this.allowedChat.includes(this.chatId)) {
			this.botServer.sendMessage(this.chatId, `You are not allowed to use this bot, your chatId is ${this.chatId} and your userId is ${this.userId}. Contact our admin users.`)
			this.log.warn({ ...msg , ...match }, 'Blocked by oauth policies')
			return false
		}

		this.log.info({
			name: msg.from.first_name,
			userName: msg.from.username,
			message: msg.text
		}, 'Message received')
		return this
	}

	adminInfo() {
		if (this.adminUsers.includes(this.userId)) {
			let adminUsersMessage = 'Admin user:'
			let allowedChatsMessage = 'Chats allowed:'
			this.adminUsers.forEach((admin) => adminUsersMessage = `${adminUsersMessage} ${admin}`)
			this.allowedChat.forEach((chat) => allowedChatsMessage = `${allowedChatsMessage} ${chat}`)

			this.botServer.sendMessage(this.chatId, `
				<b>Here is what we have!</b>
				<code>${adminUsersMessage}</code>
				<code>${allowedChatsMessage}</code>
			`, { parse_mode: 'HTML' })
		}
	}
}

module.exports = Help