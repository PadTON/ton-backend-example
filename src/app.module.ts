/* eslint-disable @typescript-eslint/no-var-requires */
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { CacheModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import * as redisStore from 'cache-manager-redis-store'
import { RedisLockModule } from 'nestjs-simple-redis-lock'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthController } from './auth/auth.controller'
import { AuthModule } from './auth/auth.module'
import { JSON_WEB_TOKEN_SERVICE } from './auth/interfaces'
import { JsonWebTokenService } from './auth/jwt.service'
import { GlobalConfigModule } from './config/config.module'

import { RolesGuard } from './guards/role.guard'
import { LoggerModule } from './logger/logger.module'
import { LoggerService } from './logger/logger.service'
import { VerifiedAdminUser, VerifiedUser } from './middleware/verifyUser.middleware'
import { PrismaService } from './prisma/prisma.service'

import { TwoFactorModule } from './two-factor/two-factor.module'
import { USER_SERVICES } from './users/interfaces/user.service.interface'
import { USER_REPOSITORY } from './users/interfaces/users.repositories.interface'
import { UserRepository } from './users/repositories/users.repositories'
import { UserController } from './users/user.controller'
import { UsersModule } from './users/user.module'
import { UserService } from './users/user.service'
import { UtilsModule } from './utils/utils.module'
import { UtilsService } from './utils/utils.service'
import { WalletModule } from './wallet/base.module'
import { WalletController } from './wallet/controller/wallet.controller'
import { TelegramModule } from './telegram/telegram.module'
import { WalletCronModule } from './wallet/base.cron.module'
require('dotenv').config()

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			url: process.env.REDIS_URL,
			ttl: Number(process.env.REDIS_COMMON_TTL),
		}),
		RedisModule.forRoot({
			config: {
				url: process.env.REDIS_URL,
			},
		}),
		ScheduleModule.forRoot(),
		RedisLockModule.register({}), // import RedisLockModule, use default configuration
		GlobalConfigModule,
		AuthModule,
		LoggerModule,
		UsersModule,
		TwoFactorModule,
		WalletModule,
		TelegramModule,
		WalletCronModule,
		UtilsModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		LoggerService,
		{
			provide: USER_SERVICES,
			useClass: UserService,
		},
		{
			provide: JSON_WEB_TOKEN_SERVICE,
			useClass: JsonWebTokenService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		PrismaService,
		UtilsService,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(VerifiedUser)
			.exclude(
				{ path: 'auth/login', method: RequestMethod.ALL },
				{ path: 'auth/refresh-token', method: RequestMethod.ALL },
				{ path: 'jwks/*', method: RequestMethod.ALL },
				{ path: '.well-known/*', method: RequestMethod.ALL },
			)
			.forRoutes(AuthController, UserController, WalletController)
		consumer
			.apply(VerifiedAdminUser)
			.exclude({ path: 'admin/auth/login', method: RequestMethod.ALL }, { path: 'admin/auth/refresh-token', method: RequestMethod.ALL })
			.forRoutes({ path: '*admin*', method: RequestMethod.ALL })
	}
}
