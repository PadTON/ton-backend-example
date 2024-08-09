import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, Post, Query, Request, UseInterceptors } from '@nestjs/common'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TokenType, TransactionType, WalletType } from '@prisma/client'
import { Address } from '@ton/core'
import BigNumber from 'bignumber.js'
import { BaseRequest } from 'src/interfaces/common.interface'
import { TransactionDto, TxnSymbol, WalletWithdrawDto } from '../dto/index.dto'
import { TransactionService } from '../services/transaction.service'
import { WalletService } from '../services/wallet.service'

import { ConfigService } from '@nestjs/config'
import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { TransactionServiceQueryDto } from '../dto/query.dto'

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('wallet')
@ApiBearerAuth('access-token')
@Controller('wallet')
export class WalletController {
	constructor(
		private readonly walletService: WalletService,
		private readonly transactionService: TransactionService,
		private readonly configService: ConfigService,
	) {}

	@Get('my-transactions')
	async getMyTransaction(@Request() req: BaseRequest, @Query() pageOptionDto: PageOptionsDto) {
		const userId = req.user?.id
		let query: TransactionServiceQueryDto = {
			ownerUserId: userId,
		}
		let result = await this.transactionService.findAll(pageOptionDto, query)
		return result
	}

	@Get('my-wallet')
	async getMyWallets(@Request() req: BaseRequest) {
		const userId = req.user?.id
		await this.walletService.findAndCreateIfNotExist(WalletType.USER, TokenType.JETTON, userId, TxnSymbol.JETTON_TOKEN)
		await this.walletService.findAndCreateIfNotExist(WalletType.USER, TokenType.JETTON, userId, TxnSymbol.USDT)
		const myWallets: any = await this.walletService.getMyWallets(userId)

		for (let index = 0; index < myWallets.length; index++) {
			const element = myWallets[index]
			myWallets[index].depositAddress = Address.parse(this.configService.get<string>('WALLET_DEPOSIT_ADDRESS')).toString()
			if (element.symbol === TxnSymbol.USDT) {
				myWallets[index].enableDeposit = true
				myWallets[index].enableWithdraw = true
			} else {
				myWallets[index].enableDepoit = false
				myWallets[index].enableWithdraw = false
			}
		}
		return myWallets
	}

	@Post('withdraw')
	async withdraw(@Request() req: BaseRequest, @Body() body: WalletWithdrawDto) {
		try {
			body.walletAddress = Address.parse(body.walletAddress).toString()
		} catch (error) {
			throw new BadRequestException('Address is invalid')
		}

		try {
			const amount = new BigNumber(body.amount)
			if (amount.isNaN() || amount.isLessThanOrEqualTo(0)) {
				throw new BadRequestException('Amount is invalid')
			}
			body.amount = amount.toString()
		} catch (error) {
			throw new BadRequestException('Amount is invalid')
		}
		const transferData: TransactionDto = {
			type: TransactionType.WITHDRAW,
			tokenType: TokenType.JETTON,
			symbol: body.symbol as TxnSymbol,
			fromUserId: req.user?.id,
			toWallet: body.walletAddress,
			amount: body.amount,
		}
		const txn = await this.transactionService.submitTransaction(transferData)
		return txn
	}
}
