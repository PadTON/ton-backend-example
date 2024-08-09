import { IsNotEmpty, IsString } from 'class-validator'

export class LinkEmailDto {
	@IsString()
	@IsNotEmpty()
	code: string

	@IsString()
	@IsNotEmpty()
	email: string

	@IsString()
	@IsNotEmpty()
	password: string
}
