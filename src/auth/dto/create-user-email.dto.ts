import { IsString, IsOptional } from 'class-validator'

export class CreateUserEmailDto {
	@IsString()
	email: string

	@IsString()
	password: string

	@IsOptional()
	@IsString()
	refCode: string

	@IsOptional()
	@IsString()
	captchaToken?: string
}
