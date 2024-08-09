import { registerAs } from '@nestjs/config'

const config = {
	tokenEndSeason: process.env.BASE_TOKEN_REWARD,
	rateRewardPerCycle: process.env.RATE_REWARD_PER_CYCLE,
}

export default registerAs('reward', () => ({ ...config }))
