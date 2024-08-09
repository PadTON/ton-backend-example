import { IsString } from 'class-validator'

export class SecondPassDto {
	@IsString()
	twoFactorCode?: string
}
