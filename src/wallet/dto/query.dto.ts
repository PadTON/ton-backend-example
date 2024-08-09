import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export interface BaseQueryDto {
	orders?: string[] | string
}

export class WalletServiceQueryDto {
	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	userId?: string
}

export class TransactionServiceQueryDto {
	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	fromUserId?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	toUserId?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	fromWallet?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	toWallet?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	symbol?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	type?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	status?: string

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	ownerUserId?: string
}
