import { registerAs } from '@nestjs/config'

const config = {
	goldBase: process.env.GOLD_OF_FARM_POOL_BASE,
	cycleFarm: process.env.CYCLE_FARM_POOL,
}

export default registerAs('farmPool', () => ({ ...config }))
