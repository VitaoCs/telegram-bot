const { BOT_MESSAGES: { OAUTH_BLOCK } } = require('../utils/constants')
class OAuth {
	constructor({ botServer, chatId, userId, botConfigs, log}) {
		const {
			keysPath,
			config: {
				adminUsers,
				allowedChat
			}
		} = botConfigs
		this.botServer = botServer
		this.chatId = chatId
		this.userId = userId
		this.adminUsers = adminUsers
		this.allowedChat = allowedChat
		this.keysPath = keysPath
		this.log = log
	}

	validateOAuth(msg, match) {
		if (!this.allowedChat.includes(this.chatId)) {
			this.botServer.sendMessage(this.chatId, OAUTH_BLOCK)
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