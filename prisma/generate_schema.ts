// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import fs from 'fs'

async function main() {
	const allFileContents = fs.readFileSync('prisma/schema.prisma', 'utf-8')
	const data = allFileContents.split('// view model')
	console.log(data)
	fs.writeFile('prisma/migrate.prisma', data[0], (err) => {
		if (err) console.log(err)
		console.log('Successfully Written to File.')
	})
}

main().catch((e) => {
	console.error('failed', e)
	process.exit(1)
})
