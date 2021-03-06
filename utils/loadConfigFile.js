const requireConfigFile = (module) => {
	delete require.cache[require.resolve(module)]
	return require(module)
}

const loadConfig = () => {
	const {
		AUTH_TOKEN,
		NGROK_TOKEN,
		ADMIN_USERS,
		ALLOWED_CHAT_ID,
		ESP32_CAM_IP
	} = requireConfigFile('../../keys.json')

	return {
		logPath: './logs/',
		keysPath: 'repos/x/keys.json',
		authorizationToken : AUTH_TOKEN,
		ngrokToken: NGROK_TOKEN,
		config : {
			adminUsers: ADMIN_USERS,
			allowedChat: ALLOWED_CHAT_ID,
			iot: {
				esp32cam: ESP32_CAM_IP
			},
			shell: {
				customCommands : [
					{ 
						command1 : ['my command 1'],
						executeWithSpawn : true
					},
					{
						testing : 'echo \'not executing with spawn\''
					}
				],
				deniedCommands : ['rm', 'rmdir', 'shutdown', 'halt', 'sudo', 'mv', 'touch', 'chmod', 'wget', 'curl', 'echo']
			}
		}
	}

}

module.exports = {
	loadConfig
}