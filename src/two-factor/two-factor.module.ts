import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'
import { USER_REPOSITORY } from 'src/users/interfaces/users.repositories.interface'
import { UserRepository } from 'src/users/repositories/users.repositories'
import { TWO_FACTOR_AUTH } from './interfaces/two-factor.service.interface'
import { TwoFactorAuthService } from './two-factor.service'

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true })],
	controllers: [],
	providers: [
		{
			provide: TWO_FACTOR_AUTH,
			useClass: TwoFactorAuthService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
		PrismaService,
	],
	exports: [
		{
			provide: TWO_FACTOR_AUTH,
			useClass: TwoFactorAuthService,
		},
	],
})
export class TwoFactorModule {}
