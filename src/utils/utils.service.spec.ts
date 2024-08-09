import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { UtilsService } from './utils.service'

describe('UtilsService', () => {
	let service: UtilsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule],
		}).compile()
		const configService = module.get<ConfigService>(ConfigService)

		service = new UtilsService(configService)
	})

	it('should be verify wallet address', () => {
		const address = '0x7dB3f8eFcf041ff07D39b725e56Bf6F0A88fDBFb'
		const result = service.isWalletAddress(address)
		expect(result).toBe(true)
	})
})
