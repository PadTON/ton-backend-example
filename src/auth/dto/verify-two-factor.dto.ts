import { IsOptional, IsString } from 'class-validator'

export class VerifyTwoFactorDto {
	@IsOptional()
	@IsString()
	twoFactorCode?: string

	@IsOptional()
	@IsString()
	emailOTP?: string
}
