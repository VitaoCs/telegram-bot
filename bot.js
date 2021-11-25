const bunyan = require('bunyan')
const TelegramBot = require('node-telegram-bot-api')
const { loadConfig } = require('./utils/loadConfigFile')
let botConfigs = loadConfig()
const {
	authorizationToken,
	logPath
}  = botConfigs
const { methodFactory } = require('./methodFactory/methodFactory')

const botServer = new TelegramBot(authorizationToken, { polling: true })
const INDEX_COMMAND = 1
let log
let method
let command
let chatId
let userId

const createLogFile = () => {
	const fileName = new Date().toDateString().replace(/ /g, '_')
	log = bunyan.createLogger({name: 'botServer', streams: [{path: `${logPath}${fileName}.txt`}]})
}

const handleMessage = (msg, match) => {
	botConfigs = loadConfig()
	createLogFile(msg, match)
	method = msg.text.split(' ')[0].split('/')[1]
	command = match[INDEX_COMMAND]
	chatId = msg.chat.id
	userId = msg.from.id
}

// match everything starting with /
botServer.onText(/\s(.*)/, async (msg, match) => {
	try {
		handleMessage(msg, match)
		const builtMethod = methodFactory(method, { command, botServer, chatId, userId, botConfigs, log }).validateOAuth(msg, match)
		if(!builtMethod) return
		await builtMethod.executeMethod()
	} catch (error) {
		const errorMessage = error.message || error
		log.error({ errorMessage }, 'Error received from factory execution')
	}
})
