const {
	execute,
	executeSpawn,
	getCustomCommand,
} = require('../utils/executeShell')

class Shell {
	constructor({command, botServer, chatId, log}) {
		this.command = command
		this.botServer = botServer
		this.chatId = chatId
		this.log = log
	}

	executeMethod() {
		const customCommand = getCustomCommand(this.command)
		if (customCommand !== null) {
			// spawn vs exec: https://stackoverflow.com/questions/48698234/node-js-spawn-vs-execute
			if (customCommand.executeWithSpawn) return executeSpawn(customCommand[this.command])

			execute(customCommand[this.command], (error, stdout, stderr) => this.botServer.sendMessage(this.chatId, `<code>${stdout}${stderr}</code>`, { parse_mode: 'HTML' }))
		}

		execute(this.command, (error, stdout, stderr) => {
			if(error) this.botServer.sendMessage(this.chatId, 'Failed to execute your command')
			else this.botServer.sendMessage(this.chatId, `<code>${stdout}${stderr}</code>`, { parse_mode: 'HTML' })
		})
	}
}

module.exports = Shell