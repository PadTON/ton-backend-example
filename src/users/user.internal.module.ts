import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { USER_INTERNAL_SERVICES } from './interfaces/user.internal.service.interface'
import { USER_REPOSITORY } from './interfaces/users.repositories.interface'
import { UserRepository } from './repositories/users.repositories'
import { UserInternalService } from './user.internal.service'

@Module({
	imports: [],
	controllers: [],
	providers: [
		PrismaService,
		{
			provide: USER_INTERNAL_SERVICES,
			useClass: UserInternalService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
	],
	exports: [
		{
			provide: USER_INTERNAL_SERVICES,
			useClass: UserInternalService,
		},
	],
})
export class UsersInternalModule {}
