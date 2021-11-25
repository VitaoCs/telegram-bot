const fs = require('fs')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const OAuth = require('./oauth')
const { BANK_INITIAL_CONFIG: { names , initialValuePerUser, dailyExpectedCosts }} = require('../utils/constants')
const { loadConfig } = require('../utils/loadConfigFile')
const { bankStatePath } = loadConfig()
const STATE_PATH = `${process.env.PWD}/${bankStatePath}`

// The method purpose is to track trip costs among friends/family
class Bank extends OAuth {
	constructor(args) {
		super(args)
		const { command } = args
		this.command = command
	}

	setupInitialState() {
		const initialState = {}
		names.forEach(name => {
			initialState[name] = {
				totalOnAccount: initialValuePerUser,
				totalSpent: 0,
				totalDaySpent: 0,
				availableDaySpent: dailyExpectedCosts,
				entries: {},
				dayEntries: []
			}
		})

		this.writeCurrentState(initialState)
		return initialState
	}

	getCurrentState() {
		const readFromFile = fs.readFileSync(STATE_PATH)
		if(readFromFile.length <= 0) return this.setupInitialState()
		
		const currentState = JSON.parse(readFromFile)
		const hasInitialState = !currentState || Object.entries(currentState).length > 0
		if (!hasInitialState) return this.setupInitialState()

		return currentState
	}

	getCurrentDate() {
		dayjs.tz.setDefault('Europe/Paris')
		return {
			date: dayjs().tz().format('DD-MM-YYYY'),
			hour: `${dayjs().tz().format('HH')}h`
		}
	}

	subtractDailyValues(user, value) {
		const {
			totalOnAccount,
			totalSpent,
			totalDaySpent,
			availableDaySpent
		} = user

		user.totalOnAccount = totalOnAccount - value
		user.totalSpent = totalSpent + value
		user.totalDaySpent = totalDaySpent + value
		user.availableDaySpent = availableDaySpent - value

		return user
	}

	endDay(user) {
		const { availableDaySpent } = user

		// take the amount left over from today and add on the available value on the next day
		user.availableDaySpent = dailyExpectedCosts + availableDaySpent
		user.totalDaySpent = 0

		return user
	}

	writeCurrentState(state) {
		const data = JSON.stringify(state, null, 2)
		fs.writeFileSync(STATE_PATH, data)
	}

	treatBankCommand() {
		const [
			operation,
			name,
			value
		] = this.command.split(' ')
		const numberOfSpaces = 3
		const index = operation.length + name.length + value.length + numberOfSpaces

		return {
			operation,
			name,
			value,
			description: this.command.substr(index)
		}
	}

	executeMethod() {
		const currentState = this.getCurrentState()
		const {
			operation,
			name,
			value,
			description
		} = this.treatBankCommand()

		if(!names.includes(name)) return this.botServer.sendMessage(this.chatId, `No name ${name} configured for this bank.`)
		if(operation !== 'add' && operation !== 'remove') return this.botServer.sendMessage(this.chatId, `No operation ${operation} configured for this bank.`)
		this[operation](currentState, name, Number(value), description)
	}

	add(currentState, name, value, description) {
		let user = currentState[name]
		const userEntries = user.entries
		const lastEntry = user.dayEntries
		const { date , hour } = this.getCurrentDate()
		
		const isFirstBankEntry = (lastEntry.length <= 0)
		const isSameDayEntry = lastEntry[lastEntry.length-1] === date

		if(isFirstBankEntry) {
			lastEntry.push(date)
			userEntries[date] = []
			userEntries[date].push({
				value,
				hour,
				description
			})
		} else if(isSameDayEntry) {
			userEntries[date].push({
				value,
				hour,
				description
			})
		} else {
			lastEntry.push(date)
			user = this.endDay(user)

			userEntries[date] = []
			userEntries[date].push({
				value,
				hour,
				description
			})
		}

		user = this.subtractDailyValues(user, value)
		user.dayEntries = lastEntry
		user.entries = userEntries
		currentState[name] = user

		this.writeCurrentState(currentState)
		this.botServer.sendMessage(this.chatId, `
				<b>${name} bank:</b>
				<code>Daily money availible: ${user.availableDaySpent}</code>
				<code>Daily total spent: ${user.totalDaySpent}</code>
				<code>On account: ${user.totalOnAccount}</code>
			`, { parse_mode: 'HTML' })
	}

	remove() {
		return this.botServer.sendMessage(this.chatId, 'Removed')
	}
}

module.exports = Bank