const fs = require('fs')
const OAuth = require('./oauth')

class Configure extends OAuth {
	constructor(args) {
		super(args)
		const { command } = args
		this.command = command
	}

	executeMethod() {
		if (this.command.includes('info')) this.botServer.sendMessage(this.chatId, `Your current chatId and userId are ${this.chatId} and ${this.userId}. Use /configure add/delete <key> <value>, to change the config.`)
		else if (this.command.includes('add')) this.addConfig()
		else if (this.command.includes('delete')) this.deleteConfig()
		else this.botServer.sendMessage(this.chatId, 'This command is not mapped. You can only use /configure info/add/delete')
	}

	// Override
	validateOAuth(msg, match) {
		if (!this.adminUsers.includes(this.userId)) {
			this.botServer.sendMessage(this.chatId, `You are not allowed to use this bot, your userId is ${this.userId}. Contact our admin users.`)
			this.log.warn({ ...msg, ...match }, 'Blocked by oauth policies')
			return false
		}

		this.log.info({
			name: msg.from.first_name,
			userName: msg.from.username,
			message: msg.text
		}, 'Message received')
		return this
	}

	addConfig() {
		const KEYS_PATH = `${process.env.HOME}/${this.keysPath}`
		const [
			operation,
			configKey,
			configValue 
		] = this.command.split(' ')

		const keys = JSON.parse(fs.readFileSync(KEYS_PATH))
		if (configKey === 'admin' || configKey === 'chat') {
			const keyToUpdate = configKey === 'admin' ? 'ADMIN_USERS' : (configKey === 'chat' ? 'ALLOWED_CHAT_ID' : undefined)
			if(!keyToUpdate) return
			keys[keyToUpdate].push(Number(configValue))
			const data = JSON.stringify(keys, null, 2)
			fs.writeFileSync(KEYS_PATH, data)

			this.log.info({
				updatedConfig: keyToUpdate,
				addedValue: configValue
			}, 'Config changed')
			this.botServer.sendMessage(this.chatId, `Added ${configValue} to ${configKey} config`)
		}  else return
	}

	deleteConfig() {
		const KEYS_PATH = `${process.env.HOME}/${this.keysPath}`
		const [
			operation,
			configKey,
			configValue 
		] = this.command.split(' ')

		const keys = JSON.parse(fs.readFileSync(KEYS_PATH))
		if (configKey === 'admin' || configKey === 'chat') {
			const keyToUpdate = configKey === 'admin' ? 'ADMIN_USERS' : (configKey === 'chat' ? 'ALLOWED_CHAT_ID' : undefined)
			if(!keyToUpdate) return

			const keyValueIndex = keys[keyToUpdate].indexOf(Number(configValue))
			if(keyValueIndex === 0) {
				this.botServer.sendMessage(this.chatId, `Can not delete ${configValue} config ${configKey}`)
				return
			} else if (keyValueIndex <= -1) {
				this.botServer.sendMessage(this.chatId, `There is no ${configValue} config with the provided value of ${configKey}`)
				return
			}

			keys[keyToUpdate].splice(keyValueIndex, 1)
			const data = JSON.stringify(keys, null, 2)
			fs.writeFileSync(KEYS_PATH, data)

			this.log.info({
				updatedConfig: keyToUpdate,
				addedValue: configValue
			}, 'Config changed')
			this.botServer.sendMessage(this.chatId, `Deleted ${configValue} from ${configKey} config`)
		}  else return
	}
}

module.exports = Configure