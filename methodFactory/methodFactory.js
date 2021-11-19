const shell = require('./shell')
const iot = require('./iot')
const tunnel = require('./tunnel')
const { INVALID_COMMAND_TYPE } = require('../utils/constants')

const methods = { shell, iot, tunnel }
module.exports = {
	methodFactory (value, attributes) {
		const Method = methods[value]
		if (!Method) throw INVALID_COMMAND_TYPE
		return new Method(attributes)
	}
}
