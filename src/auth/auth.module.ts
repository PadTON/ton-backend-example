import { RedisModule } from '@liaoliaots/nestjs-redis'
import { Module } from '@nestjs/common'
import { RedisLockModule } from 'nestjs-simple-redis-lock'
import { PrismaService } from 'src/prisma/prisma.service'
import { TwoFactorModule } from 'src/two-factor/two-factor.module'
import { UsersModule } from 'src/users/user.module'
import { UtilsService } from 'src/utils/utils.service'
import { AdminAuthController } from './auth-admin.controller'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JSON_WEB_TOKEN_SERVICE } from './interfaces'
import { AUTH_REPOSITORY } from './interfaces/auth.repository.interface'
import { AUTH_SERVICE } from './interfaces/auth.service.interface'
import { JsonWebKeyController } from './jwks.controller'
import { JsonWebTokenService } from './jwt.service'
import AuthRepository from './repositories/auth.repository'
import { WellKnownController } from './wellknown.controller'

@Module({
	imports: [
		UsersModule,
		TwoFactorModule,
		RedisModule.forRoot({
			config: {
				url: process.env.REDIS_URL,
			},
		}),
		RedisLockModule.register({}), // import RedisLockModule, use default configuration,
	],
	providers: [
		{
			provide: AUTH_SERVICE,
			useClass: AuthService,
		},
		{
			provide: AUTH_REPOSITORY,
			useClass: AuthRepository,
		},
		{
			provide: JSON_WEB_TOKEN_SERVICE,
			useClass: JsonWebTokenService,
		},
		PrismaService,
		UtilsService,
	],
	controllers: [AuthController, AdminAuthController, JsonWebKeyController, WellKnownController],
})
export class AuthModule {}
