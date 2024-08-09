import { Inject, Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { UserQueryDto, WhereUser } from './dto/query-user.dto'
import { UserEntity } from './entities/user.entity'
import { IUserInternalService } from './interfaces/user.internal.service.interface'
import { IUserRepository, USER_REPOSITORY } from './interfaces/users.repositories.interface'

@Injectable()
export class UserInternalService implements IUserInternalService {
	private readonly logger = new Logger(UserInternalService.name)

	constructor(@Inject(USER_REPOSITORY) private userRepository: IUserRepository) {}

	async findOne(userQueryDto: UserQueryDto): Promise<UserEntity> {
		const whereUser = new WhereUser(userQueryDto)
		const whereParams: Prisma.UserWhereInput = whereUser.query
		const users = await this.userRepository.findMany({ where: whereParams })

		if (!users.length) return undefined
		return users[0]
	}
}
