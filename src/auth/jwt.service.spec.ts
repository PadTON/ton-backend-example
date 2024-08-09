import { Test, TestingModule } from '@nestjs/testing'
import { JsonWebTokenService } from './jwt.service'
import { JSON_WEB_TOKEN_SERVICE } from './interfaces'
import { faker } from '@faker-js/faker'
jest.useFakeTimers()

describe('JsonWebTokenService', () => {
	let service: JsonWebTokenService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: JSON_WEB_TOKEN_SERVICE,
					useClass: JsonWebTokenService,
				},
			],
		}).compile()

		service = module.get<JsonWebTokenService>(JSON_WEB_TOKEN_SERVICE)
	})

	it('should be generate key json', async () => {
		await service.generateKey()
		const key = await service.getKey()
		expect(key).not.toBeNull()
	})

	it('should be sign token from payload', async () => {
		const payload = {
			exp: Math.floor((Date.now() + 86400000) / 1000),
			iat: Math.floor(Date.now() / 1000),
			sub: faker.datatype.uuid(),
		}
		const token = await service.sign(payload)
		expect(token).not.toBeNull()
	})

	it('should be verify token', async () => {
		const payload = {
			exp: Math.floor((Date.now() + 86400000) / 1000),
			iat: Math.floor(Date.now() / 1000),
			sub: faker.datatype.uuid(),
		}
		const token = await service.sign(payload)
		const decode = await service.decode(token)
		expect(decode).toEqual(payload)
	})
})
