import {
	Controller,
	Get,
	Body,
	Param,
	Put,
	Query,
	Inject,
	ClassSerializerInterceptor,
	UseInterceptors,
	Req,
	BadRequestException,
} from '@nestjs/common'
import { AdminUpdateUserDto } from './dto/update-user.dto'
import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { UserQueryDto } from './dto/query-user.dto'
import { PageDto } from 'src/utils/page.dto'
import { IUserService, USER_SERVICES } from './interfaces/user.service.interface'
import { UserEntity, UserRole } from './entities/user.entity'
import { UtilsService } from 'src/utils/utils.service'
import { Roles } from 'src/guards/role.decorator'
import { BaseRequest } from 'src/interfaces/common.interface'

@Roles(UserRole.STAFF)
@Controller('admin/users')
export class UserAdminController {
	constructor(@Inject(USER_SERVICES) private readonly userService: IUserService, private readonly utilsService: UtilsService) {}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get()
	async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() userQueryDto: UserQueryDto): Promise<PageDto<UserEntity>> {
		const users = await this.userService.findAll(pageOptionDto, userQueryDto)
		return users
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get('me')
	async getMyProfile(@Req() req: BaseRequest): Promise<UserEntity> {
		const id = req.user.id
		const user = await this.userService.findById(id)
		if (!user) throw new BadRequestException('User not found')
		return user
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<UserEntity> {
		const user = await this.userService.findById(id)
		if (!user) throw new BadRequestException('User not found')
		return user
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Put(':id/update-status')
	async update(@Param('id') id: string, @Body() updateUserDto: AdminUpdateUserDto, @Req() request) {
		const updatedData: UserEntity = {
			status: updateUserDto.status,
		}
		const userUpdated = await this.userService.update(id, updatedData)
		return userUpdated
	}
}
