import { ApiProperty } from '@nestjs/swagger'
import { TokenType, TransactionType, WalletType } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum TxnSymbol {
	TON = 'TON',
	USDT = 'USDT',
	CREDIT = 'CREDIT',
	JETTON_TOKEN = 'JET',
}

export interface TransactionDto {
	fromUserId?: string
	toUserId?: string
	tokenType?: TokenType
	fromWalletType?: WalletType
	toWalletType?: WalletType
	fromWallet?: string
	toWallet?: string
	symbol: TxnSymbol
	type: TransactionType
	amount: string
	memo?: string
	metaData?: any
	refId?: string
	refTxId?: string
	txnFee?: string
}

export class WalletWithdrawDto {
	@ApiProperty({ required: true })
	@IsString()
	walletAddress?: string

	@ApiProperty({ required: true })
	@IsEnum(TxnSymbol)
	symbol?: string

	@ApiProperty({ required: true })
	@IsString()
	amount?: string
}
