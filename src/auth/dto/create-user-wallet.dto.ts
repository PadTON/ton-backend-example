import { IsString } from 'class-validator'

export class CreateUserWalletDto {
	@IsString()
	address: string
}
