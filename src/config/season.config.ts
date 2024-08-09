import { registerAs } from '@nestjs/config'

const config = {
	startFirstSeason: process.env.FIRST_SEASON_START_AT,
	cycleSeason: process.env.CYCLE_SEASON,
}

export default registerAs('season', () => ({ ...config }))
