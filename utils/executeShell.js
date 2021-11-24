const { exec, spawn } = require('child_process')
const { loadConfig } = require('../utils/loadConfigFile')
const {
	config: {
		shell: { customCommands, deniedCommands },
	},
} = loadConfig()

const execute = (command, callback) => {
	exec(command, (error, stdout, stderr) => { callback(error, stdout, stderr) })
}

const executeSpawn = (command) => {
	let args = []
	if (command.length > 1) args = command.slice(1)

	spawn(command[0], args, { detached: true, shell: true })
		.on('error', (err) => console.log(err))
}

const getCustomCommand = (command) => {
	for (let i = 0; i < customCommands.length; i++) {
		if (customCommands[i][command] !== undefined) return customCommands[i]
	}
	return null
}

const existDeniedCommands = (command) => {
	for (let i = 0; i < deniedCommands.length; i++) {
		if (command.indexOf(deniedCommands[i]) > -1) return true
	}
	return false
}

module.exports = {
	execute,
	executeSpawn,
	getCustomCommand,
	existDeniedCommands,
}
