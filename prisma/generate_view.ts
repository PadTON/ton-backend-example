// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function main() {}

main().catch((e) => {
	console.error('failed', e)
	process.exit(1)
})
