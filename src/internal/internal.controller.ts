import { Controller, Get, Inject, Param, Query } from '@nestjs/common'
import { UserEntity } from 'src/users/entities'
import { IUserInternalService, USER_INTERNAL_SERVICES } from 'src/users/interfaces/user.internal.service.interface'
import { UserQueryDto } from 'src/users/dto/query-user.dto'

@Controller('internal')
export class UserIdentityInternalController {
	constructor(@Inject(USER_INTERNAL_SERVICES) private readonly userInternalService: IUserInternalService) {}

	@Get('users/')
	async findUser(@Query() filter: UserQueryDto): Promise<UserEntity> {
		const user = await this.userInternalService.findOne(filter)
		if (!user) return null
		return user
	}
}
