import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class LoginMiniAppDto {
	@IsString()
	@ApiProperty()
	data: string
}
