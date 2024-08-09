import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { AuthUserEntity, AuthUserStatus } from './entities/user.entity'
import { faker } from '@faker-js/faker'
import { WalletProviderModule } from 'src/wallet-provider/wallet-provider.module'
import { FirebaseModule } from 'src/firebase/firebase.module'
import { CloudPubSubModule } from 'src/cloud-pub-sub/cloud-pub-sub.module'
import { ProtoServiceModule } from 'src/proto-service/proto-service.module'
import { ConfigModule } from '@nestjs/config'
import { CacheModule, Logger } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'
import AuthRepository from './repositories/auth.repository'
import { AUTH_REPOSITORY } from './interfaces/auth.repository.interface'
import { UsersModule } from 'src/users/user.module'
import { PrismaModule } from 'src/prisma/prisma.module'

jest.useFakeTimers()

describe('AuthService', () => {
	let service: AuthService
	const logger = new Logger('TestAuthService')

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				CacheModule.register({
					isGlobal: true,
					store: redisStore,
					url: process.env.REDIS_URL,
					ttl: Number(process.env.REDIS_COMMON_TTL),
				}),
				PrismaModule,
				WalletProviderModule,
				FirebaseModule,
				CloudPubSubModule,
				ProtoServiceModule,
				UsersModule,
			],
			providers: [
				AuthService,
				{
					provide: AUTH_REPOSITORY,
					useClass: AuthRepository,
				},
			],
		}).compile()

		service = module.get<AuthService>(AuthService)
	})

	function genUser() {
		return new AuthUserEntity({
			id: faker.datatype.uuid(),
			email: faker.internet.email(),
			nickName: faker.name.fullName(),
			address: faker.address.streetAddress(),
			status: faker.helpers.arrayElement([AuthUserStatus.ACTIVED, AuthUserStatus.INACTIVED, AuthUserStatus.BANNED]),
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			walletAddress: faker.address.streetAddress(),
			birthday: faker.date.past().getTime(),
			isAdmin: faker.datatype.boolean(),
			signedInAt: faker.date.past().getTime(),
			signedUpAt: faker.date.past().getTime(),
		})
	}

	it('should be notified', async () => {
		const user = genUser()
		const message = await service.notify(user)
		logger.log(message)
	})
})
