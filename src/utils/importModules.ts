import { readdirSync, statSync } from 'fs'
import * as _ from 'lodash'

export const importDefaultModules = <T = any>(dirpath: string, matchs: RegExp[], level = 0): T[] => {
	try {
		const filepaths = readdirSync(dirpath)
		const defaultModules = filepaths.map((filepath) => {
			const statFile = statSync(`${dirpath}/${filepath}`)
			if (statFile.isDirectory() && level > 0) {
				const modules = importDefaultModules(`${dirpath}/${filepath}`, matchs, level - 1)
				return modules
			}
			if (matchs.filter((match) => `${dirpath}/${filepath}`.match(match))?.length) {
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const importedModule = require(`${dirpath}/${filepath}`)
				return importedModule.default
			}
			return null
		})
		return _.flattenDeep(defaultModules.filter((defaultModule) => !_.isNil(defaultModule)))
	} catch (error) {
		throw error
	}
}
