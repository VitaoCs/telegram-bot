const {
	BOT_MESSAGES: {
		OAUTH_BLOCK, 
		SHELL_BLOCK,
		SHELL_ERROR_EXECUTION
	}
} = require('../utils/constants')
const OAuth = require('./oauth')
const {
	execute,
	executeSpawn,
	getCustomCommand,
	existDeniedCommands
} = require('../utils/executeShell')
const { HTML_SMALLER, HTML_GREATER } = require('../utils/constants')

class Shell extends OAuth {
	constructor(args) {
		super(args)
		const { command }= args
		this.command = command
	}

	isValidShellCommand () {
		if (existDeniedCommands(this.command)) {
			this.botServer.sendMessage(this.chatId, SHELL_BLOCK)
			return false
		}
		return true
	}

	executeMethod() {
		const customCommand = getCustomCommand(this.command)
		if (customCommand !== null) {
			// spawn vs exec: https://stackoverflow.com/questions/48698234/node-js-spawn-vs-execute
			if (customCommand.executeWithSpawn) return executeSpawn(customCommand[this.command])

			execute(customCommand[this.command], (error, stdout, stderr) => this.botServer.sendMessage(this.chatId, `<code>${stdout}${stderr}</code>`, { parse_mode: 'HTML' }))
		}

		execute(this.command, (error, stdout, stderr) => {
			if(error) this.botServer.sendMessage(this.chatId, SHELL_ERROR_EXECUTION)
			else this.botServer.sendMessage(this.chatId, `<code>${stdout}${stderr}</code>`, { parse_mode: 'HTML' })
		})
	}

	help() {
		this.botServer.sendMessage(this.chatId, `
				<b>This command is restrict to admin users, you can run simple shell commands on the server.</b>
				\n There are allowed and blocked commands. Contact our admin users for more information.
				\n Use the following command:
				<code>/shell ${HTML_SMALLER}your_command${HTML_GREATER}</code>
			`, { parse_mode: 'HTML' })
	}

	// Override
	validateOAuth(msg, match) {
		if (!this.adminUsers.includes(this.userId)) {
			this.botServer.sendMessage(this.chatId, OAUTH_BLOCK)
			this.log.warn({ ...msg , ...match }, 'Blocked by oauth policies')
			return false
		}
		if (!this.isValidShellCommand()) {
			this.log.warn({ ...msg , ...match }, 'Blocked by command policies')
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

module.exports = Shell