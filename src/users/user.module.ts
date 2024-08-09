import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserRepository } from './repositories/users.repositories'
import { PrismaService } from 'src/prisma/prisma.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { USER_SERVICES } from './interfaces/user.service.interface'
import { USER_REPOSITORY } from './interfaces/users.repositories.interface'
import { ConfigModule } from '@nestjs/config'
import { UtilsService } from 'src/utils/utils.service'
import { UserAdminController } from './user.admin.controller'

@Module({
	imports: [PrismaModule, ConfigModule],
	controllers: [UserController, UserAdminController],
	providers: [
		{
			provide: USER_SERVICES,
			useClass: UserService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
		PrismaService,
		UtilsService,
	],
	exports: [
		{
			provide: USER_SERVICES,
			useClass: UserService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
	],
})
export class UsersModule {}
