import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'
import * as moment from 'moment'
import { UserEntity, UserRole, UserStatus } from '../entities'

const defaultAvatar = process.env.DEFAULT_AVATAR
export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	id: string

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	identifier: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	email: string

	@IsString()
	@ApiProperty()
	firstName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ default: '' })
	lastName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	nickName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	address: string

	@IsString()
	@IsOptional()
	walletAddress: string

	@IsUrl()
	@IsOptional()
	@ApiPropertyOptional()
	avatar: string

	@IsInt()
	@IsOptional()
	@ApiProperty()
	birthday?: number

	@IsOptional()
	@ApiPropertyOptional({
		default: UserStatus.ACTIVATED,
	})
	status: UserStatus

	@IsOptional()
	state: string

	static fromGCPubsubEvent(messageData: any): UserEntity {
		const user: UserEntity = {
			id: messageData.id,
			status: UserStatus.ACTIVATED,
			identifier: messageData.email || messageData.id,
			signedInAt: messageData.signedInAt || moment().unix(),
			signedUpAt: messageData.signedUpAt || moment().unix(),
			verifiedAt: undefined,
			createdAt: undefined,
			updatedAt: undefined,
		}
		return user
	}

	static toEntity(dto: CreateUserDto): UserEntity {
		return {
			id: dto.id,
			identifier: dto.id,
			status: dto.status,
			signedInAt: null,
			signedUpAt: null,
			verifiedAt: null,
			createdAt: moment().toDate(),
			updatedAt: moment().toDate(),
		}
	}

	static toPrisma(createDto: CreateUserDto): UserCreateInput {
		const { id, email, firstName, lastName, nickName, walletAddress, avatar, birthday, status, state, identifier, address } = createDto
		return {
			identifier,
			id,
			email,
			first_name: firstName,
			last_name: lastName,
			nick_name: nickName,
			wallet_address: walletAddress,
			avatar,
			birthday,
			state,
			status,
			address,
		}
	}
}

interface UserCreateInput {
	id: string
	identifier: string
	email?: string | null
	first_name: string
	last_name?: string
	nick_name?: string | null
	wallet_address?: string | null
	avatar?: string | null
	birthday?: number | null
	is_admin?: boolean
	status?: UserStatus
	two_factor_authentication_secret?: string | null
	is_enable_two_factor?: boolean
	signed_in_at?: number | null
	signed_up_at?: number | null
	state: string
	address: string
}
