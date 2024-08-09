import { IsString } from 'class-validator'

export class SignWalletDto {
	@IsString()
	address: string

	@IsString()
	signature: string
}
