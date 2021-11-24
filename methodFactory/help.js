const OAuth = require('./oauth')
class Help extends OAuth {
	constructor(args) {
		super(args)
		const { command } = args
		this.command = command
	}

	executeMethod() {
		switch (this.command) {
		case 'shell':
			this.botServer.sendMessage(this.chatId, 'Use /shell <your_command> to execute a bash command on the server. There are allowed and blocked commands. Contact our admin users for more information.')
			break
		case 'iot':
			this.botServer.sendMessage(this.chatId, 'Use /iot <iot_group> to execute the automated iot group command.')
			break
		case 'tunnel':
			this.botServer.sendMessage(this.chatId, 'Use /tunnel <on/off> to create a tunnel to access server hosted urls.')
			break
		case 'configure':
			this.botServer.sendMessage(this.chatId, 'Use /configure add/delete <key> <value>, to change the config or /configure info')
			break
		case 'admin':
			this.adminInfo()
			break
		default:
			this.botServer.sendMessage(this.chatId, 'You can perform the following bot commands: shell, iot, tunnel, configure, admin. Type /help <command>, for more information')
			break
		}
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