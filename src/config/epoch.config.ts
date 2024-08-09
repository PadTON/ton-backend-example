import { registerAs } from '@nestjs/config'

const config = {
	epochStartAt: process.env.EPOCH_START_AT,
	cycleEpoch: process.env.CYCLE_EPOCH,
	maxCycle: process.env.MAX_EPOCH_CYCLE,
}
export default registerAs('epoch', () => ({ ...config }))
