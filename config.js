const {
	AUTH_TOKEN,
	NGROK_TOKEN,
	ADMIN_USERS,
	ESP32_CAM_IP
} = require('../keys.json')


module.exports = {
	logPath: './logs/',	
	authorizationToken : AUTH_TOKEN,
	ngrokToken: NGROK_TOKEN,
	config : {
		adminUsers : ADMIN_USERS,
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