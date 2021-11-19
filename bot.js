const bunyan = require('bunyan')
const TelegramBot = require('node-telegram-bot-api')
const {
	existDeniedCommands,
} = require('./utils/executeShell')
const botConfigs = require('./config')
const {
	authorizationToken,
	config: { adminUsers },
	logPath
}  = botConfigs
const { methodFactory } = require('./methodFactory/methodFactory')

const botServer = new TelegramBot(authorizationToken, { polling: true })
const INDEX_COMMAND = 1
let log
let method
let command
let chatId

const createLogFile = () => {
	const fileName = new Date().toDateString().replace(/ /g, '_')
	log = bunyan.createLogger({name: 'botServer', streams: [{path: `${logPath}${fileName}.txt`}]})
}

const isValidOAuth = () => {
	if (!adminUsers.includes(chatId)) {
		botServer.sendMessage(chatId, 'You are not allowed to perform this command!')
		return false
	}
	return true
}

const isValidShellCommand = () => {
	if (existDeniedCommands(command)) {
		botServer.sendMessage(chatId, 'You are not allowed to perform this command!')
		return false
	}
	return true
}

const handleMessage = (msg, match) => {
	createLogFile(msg, match)
	method = msg.text.split(' ')[0].split('/')[1]
	command = match[INDEX_COMMAND]
	chatId = msg.chat.id
	if (!isValidOAuth()) {
		log.warn({ ...msg , ...match }, 'Blocked by oauth policies')
		return false
	}
	if (method === 'shell') {
		if (!isValidShellCommand()) {
			log.warn({ ...msg , ...match }, 'Blocked by command policies')
			return false
		}
	}

	log.info({
		name: msg.from.first_name,
		userName: msg.from.username,
		message: msg.text
	}, 'Message received')
	return true
}

// match everything starting with /
botServer.onText(/\s(.*)/, async (msg, match) => {
	try {
		if(!handleMessage(msg, match)) return
		await methodFactory(method, { command, botServer, chatId, botConfigs, log }).executeMethod()
	} catch (error) {
		log.error({...error}, 'Error received from factory execution')
	}
})
