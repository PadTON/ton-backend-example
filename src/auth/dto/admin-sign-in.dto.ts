import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AdminSignInDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	identifier: string

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	password: string
}
