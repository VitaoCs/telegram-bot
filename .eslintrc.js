module.exports = {
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
	],
	rules: {
		indent: [
			'error',
			'tab'
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'never',
		],
	},
}
