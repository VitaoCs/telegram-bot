const fs = require('fs')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const OAuth = require('./oauth')
const { HTML_SMALLER, HTML_GREATER, BANK_INITIAL_CONFIG: { names , initialValuePerUser, dailyExpectedCosts }} = require('../utils/constants')
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

	addToDailyValues(user, value) {
		const {
			totalOnAccount,
			totalSpent,
			totalDaySpent,
			availableDaySpent
		} = user

		user.totalOnAccount = totalOnAccount + value
		user.totalSpent = totalSpent - value
		user.totalDaySpent = value > totalDaySpent ? 0 : totalDaySpent - value
		user.availableDaySpent = availableDaySpent + value

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
		const index = value ? operation.length + name.length + value.length + numberOfSpaces : 1

		return {
			operation,
			name,
			value: value || 0,
			description: this.command.substr(index)
		}
	}

	validateAdminOAuth() {
		if (!this.adminUsers.includes(this.userId)) {
			this.botServer.sendMessage(this.chatId, 'Not allowed to use this method. Contact admin user')
			return false
		}
		return true
	}

	executeMethod() {
		const currentState = this.getCurrentState()
		const {
			operation,
			name,
			value,
			description
		} = this.treatBankCommand()

		if(operation !== 'info' && !names.includes(name)) return this.botServer.sendMessage(this.chatId, `No name ${name} configured for this bank.`)
		if(operation !== 'add' && operation !== 'remove' && operation !== 'info') return this.botServer.sendMessage(this.chatId, `No operation ${operation} configured for this bank.`)
		this[operation](currentState, name, Number(value), description)
	}

	help() {
		this.botServer.sendMessage(this.chatId, `
				<b>This is the bank manager for a trip, you can use the following commands:</b>
				\n To add a user expense for the day:
				<code>/bank add ${HTML_SMALLER}name${HTML_GREATER} ${HTML_SMALLER}value${HTML_GREATER} ${HTML_SMALLER}description${HTML_GREATER}</code>
				\n To remove the last entry for the user (need admin permission):
				<code>/bank remove ${HTML_SMALLER}name${HTML_GREATER}</code>
				\n To retrieve bank info, you can use:
				<code>/bank info</code>
				\n Or for more detailed info:
				<code>/bank info ${HTML_SMALLER}name${HTML_GREATER}</code>
			`, { parse_mode: 'HTML' })
	}

	printUserBankBaseInfo(name, { totalOnAccount, totalDaySpent, availableDaySpent }) {
		return `
			<b>${name} bank:</b>
			<code>Available to spent today: ${availableDaySpent}</code>
			<code>Already spent today: ${totalDaySpent}</code>
			<code>Total on account: ${totalOnAccount}</code>
		`
	}
	
	printUserBankEntryInfo({ value, hour, description }) {
		return `
			<code>€${value} at ${hour}, ${description}</code>
		`
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

	remove(currentState, name) {
		if(!this.validateAdminOAuth()) return
		let user = currentState[name]
		const userEntries = user.entries
		let lastEntryDate = user.dayEntries
		lastEntryDate = lastEntryDate[lastEntryDate.length-1]
		
		const dayEntries = userEntries[lastEntryDate]
		const lastEntry = dayEntries.pop()

		// If there is no more entries for this day and the admin wants to continue removing it
		// just remove the last dayEntry registry
		if(!lastEntry) {
			lastEntryDate = user.dayEntries.pop()
			currentState[name] = user
			this.writeCurrentState(currentState)
			return this.botServer.sendMessage(this.chatId, `Removed ${lastEntryDate} day entry from this bank.`)
		}

		userEntries[lastEntryDate] = dayEntries
		user.entries = userEntries
		currentState[name] = this.addToDailyValues(user, lastEntry.value)
		this.writeCurrentState(currentState)

		this.botServer.sendMessage(this.chatId, `
				<b>Removed last entry from ${name} bank:</b>
				<code>Value: ${lastEntry.value}</code>
				<code>Hour: ${lastEntry.hour}</code>
				<code>Description: ${lastEntry.description}</code>
			`, { parse_mode: 'HTML' })
	}

	info(currentState, name) {
		let infoMessage = 'Here is what we have!\n'
		if(name) {
			infoMessage = infoMessage + this.printUserBankBaseInfo(name, currentState[name])
			infoMessage = infoMessage + '\nUser entries:\n'
			const lastDayWithEntries = currentState[name].dayEntries.pop()
			currentState[name].entries[lastDayWithEntries].forEach(entry => {
				infoMessage = infoMessage + this.printUserBankEntryInfo(entry)
			})
		}
		else Object.entries(currentState).forEach(user => infoMessage = infoMessage + this.printUserBankBaseInfo(user[0], user[1]))
		this.botServer.sendMessage(this.chatId, infoMessage, { parse_mode: 'HTML' })
	}
}

module.exports = Bank