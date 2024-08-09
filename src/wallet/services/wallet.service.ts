import { Prisma, TokenType, Wallet, WalletType } from '@prisma/client'
import { BaseService } from 'src/common/base.service'
import { WalletRepository } from '../repositories/wallet.repository'
import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import * as moment from 'moment'
import BigNumber from 'bignumber.js'
import { WalletServiceQueryDto } from '../dto/query.dto'
@Injectable()
export class WalletService extends BaseService<Wallet, WalletRepository> {
	constructor(private repository: WalletRepository) {
		super()
	}

	getDefaultRepository(): WalletRepository {
		return this.repository
	}

	buildWhereQuery(queryDto: WalletServiceQueryDto) {
		const whereParams = []

		if (queryDto.userId) {
			whereParams.push({
				userId: queryDto.userId,
			})
		}

		return {
			query: Prisma.validator<Prisma.WalletWhereInput>()({
				AND: whereParams,
			}),
			orders: this.buildOrders(queryDto),
		}
	}

	async findAndCreateIfNotExist(walletType: WalletType, tokenType: TokenType, userId: string, symbol: string): Promise<Wallet> {
		const wallet = await this.findFirst({
			userId,
			walletType,
			tokenType,
			symbol,
		})
		if (!wallet) {
			return await this.create({
				id: randomUUID(),
				userId,
				walletType: walletType,
				tokenType,
				symbol,
				availableBalance: '0',
				beforeAvailableBalance: '0',
				lockedBalance: '0',
				beforeLockedBalance: '0',
				totalBalance: '0',
				beforeTotalBalance: '0',
			} as Wallet)
		}
		return wallet
	}

	async getMyWallets(userId: string) {
		return this.findMany({ where: { userId: userId } })
	}
}
