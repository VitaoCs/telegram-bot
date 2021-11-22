const {
	config: { adminUsers }
} = require('../config')

class OAuth {
	constructor({ botServer, chatId, log}) {
		this.botServer = botServer
		this.chatId = chatId
		this.log = log
	}

	validateOAuth(msg, match) {
		if (!adminUsers.includes(this.chatId)) {
			this.botServer.sendMessage(this.chatId, 'You are not allowed to use this bot!')
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
}

module.exports = OAuth