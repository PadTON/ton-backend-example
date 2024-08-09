import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'
import { UserEntity, UserStatus } from '../entities'
import moment from 'moment'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AdminUpdateUserDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	firstName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	lastName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	telegram: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	nickName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	address: string

	@IsUrl()
	@IsOptional()
	@ApiPropertyOptional()
	avatar: string

	@IsNumber()
	@IsOptional()
	@ApiPropertyOptional()
	birthYear: number

	@IsEnum(UserStatus)
	@IsOptional()
	@ApiPropertyOptional()
	status: UserStatus

	@IsOptional()
	// @IsNumber()
	@IsDate()
	@ApiPropertyOptional()
	signedInAt: Date

	@IsBoolean()
	@IsOptional()
	@ApiPropertyOptional()
	isEnableTwoFactor: boolean

	static toEntity(dto: AdminUpdateUserDto): UserEntity {
		return {
			id: undefined,
			identifier: undefined,
			status: dto.status,
			signedInAt: dto.signedInAt,
			signedUpAt: undefined,
			verifiedAt: undefined,
			createdAt: undefined,
			updatedAt: moment().toDate(),
		}
	}
}

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	walletAddress: string
}
