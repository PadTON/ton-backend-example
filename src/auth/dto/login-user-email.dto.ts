import { IsOptional, IsString } from 'class-validator'

export class LoginUserEmailDto {
	@IsString()
	email: string

	@IsString()
	password: string

	@IsOptional()
	@IsString()
	captchaToken: string
}
