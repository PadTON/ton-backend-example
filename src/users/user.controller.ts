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
	UnauthorizedException,
} from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { UserQueryDto } from './dto/query-user.dto'
import { PageDto } from 'src/utils/page.dto'
import { IUserService, USER_SERVICES } from './interfaces/user.service.interface'
import { UserEntity } from './entities/user.entity'
import { UtilsService } from 'src/utils/utils.service'
import { AuthErrorMessage } from 'src/auth/constants'
import { BaseRequest } from 'src/interfaces/common.interface'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Address } from '@ton/core'

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
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
	async findOne(@Req() req: BaseRequest, @Param('id') id: string): Promise<UserEntity> {
		if (!id) {
			id = req.user.id
		}
		const user = await this.userService.findById(id)
		if (!user) throw new BadRequestException('User not found')
		return user
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Put(':id')
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() request) {
		const user = request.user
		if (!user) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)

		if (updateUserDto.walletAddress) {
			try {
				updateUserDto.walletAddress = Address.parse(updateUserDto.walletAddress).toString()
			} catch (error) {
				throw new BadRequestException('Address is invalid')
			}
		}
		const updateData: UserEntity = {
			...updateUserDto,
		}
		const userUpdated = await this.userService.update(id, updateData)
		return userUpdated
	}
}
