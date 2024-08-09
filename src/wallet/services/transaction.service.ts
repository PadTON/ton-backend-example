import { Prisma, TokenType, Transaction, TransactionStatus, TransactionType, Wallet, WalletType } from '@prisma/client'
import { BaseService } from 'src/common/base.service'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { TransactionRepository } from '../repositories/transaction.repository'
import { randomUUID } from 'crypto'
import * as moment from 'moment'
import { TransactionDto } from '../dto/index.dto'
import { WalletService } from './wallet.service'
import BigNumber from 'bignumber.js'
import { TransactionServiceQueryDto } from '../dto/query.dto'

function isValidBigNumber(value: string): boolean {
	try {
		new BigNumber(value)
		return true
	} catch (e) {
		return false
	}
}

@Injectable()
export class TransactionService extends BaseService<Transaction, TransactionRepository> {
	private readonly logger = new Logger(TransactionService.name)
	constructor(private repository: TransactionRepository, private readonly walletService: WalletService) {
		super()
	}

	getDefaultRepository(): TransactionRepository {
		return this.repository
	}

	buildWhereQuery(queryDto: TransactionServiceQueryDto) {
		const whereParams = []

		if (queryDto.fromUserId) {
			whereParams.push({
				fromUserId: queryDto.fromUserId,
			})
		}

		if (queryDto.toUserId) {
			whereParams.push({
				toUserId: queryDto.toUserId,
			})
		}

		if (queryDto.type) {
			whereParams.push({
				type: queryDto.type,
			})
		}

		if (queryDto.status) {
			whereParams.push({
				status: queryDto.status,
			})
		}

		if (queryDto.ownerUserId) {
			whereParams.push({
				OR: [
					{
						fromUserId: queryDto.ownerUserId,
					},
					{
						toUserId: queryDto.ownerUserId,
					},
				],
			})
		}

		return {
			query: Prisma.validator<Prisma.WalletWhereInput>()({
				AND: whereParams,
			}),
			orders: this.buildOrders(queryDto),
		}
		return {}
	}

	async submitTransaction(transaction: TransactionDto) {
		const { fromUserId, toUserId, fromWalletType, toWalletType, symbol, type, amount, memo, refId, tokenType, txnFee, metaData } = transaction
		const fWalletType = fromWalletType || WalletType.USER
		const tWalletType = toWalletType || WalletType.USER

		let isTransactionValid = true
		let msg = ''
		if (type === TransactionType.DEPOSIT) {
			if (!toUserId) {
				isTransactionValid = false
				msg = 'Missing toUserId'
			}
		} else if (type === TransactionType.WITHDRAW) {
			if (!fromUserId) {
				isTransactionValid = false
				msg = 'Missing fromUserId'
			}
		} else if (type === TransactionType.TRANSFER) {
			if (!fromUserId) {
				isTransactionValid = false
				msg = 'Missing fromUserId'
			}
			if (!toUserId) {
				isTransactionValid = false
				msg = 'Missing toUserId'
			}
		}

		if (tokenType === TokenType.JETTON) {
			if (!symbol) {
				isTransactionValid = false
				msg = 'Missing symbol'
			}
		}

		if (!isValidBigNumber(amount)) {
			isTransactionValid = false
			msg = 'Invalid amount'
		}

		if (isNaN(Number(amount))) {
			isTransactionValid = false
			msg = 'Invalid amount'
		}

		if (BigNumber(amount).lte(0)) {
			isTransactionValid = false
			msg = 'Invalid amount'
		}

		if (!isTransactionValid) {
			this.logger.log({
				message: `Invalid transaction data : ${msg}`,
				transaction,
			})
			throw new BadRequestException('Invalid transaction data')
		}
		let fromWallet: Wallet = undefined
		let toWallet: Wallet = undefined
		let isRequireBalanceCheck = false
		if (type === TransactionType.WITHDRAW) {
			fromWallet = await this.walletService.findAndCreateIfNotExist(fWalletType, tokenType, fromUserId, symbol)
			isRequireBalanceCheck = true
		} else if (type === TransactionType.DEPOSIT) {
			toWallet = await this.walletService.findAndCreateIfNotExist(tWalletType, tokenType, toUserId, symbol)
			isRequireBalanceCheck = false
		} else if (type === TransactionType.TRANSFER) {
			fromWallet = await this.walletService.findAndCreateIfNotExist(fWalletType, tokenType, fromUserId, symbol)
			toWallet = await this.walletService.findAndCreateIfNotExist(tWalletType, tokenType, toUserId, symbol)
			isRequireBalanceCheck = fWalletType === WalletType.USER
		} else {
			this.logger.log({
				message: 'Invalid transaction type',
				transaction,
			})
			throw new BadRequestException('Invalid transaction type')
		}
		if (isRequireBalanceCheck && Number(fromWallet.availableBalance) < Number(amount)) {
			this.logger.log({
				message: 'Insufficient balance',
				transaction,
			})
			throw new BadRequestException('Insufficient balance')
		}
		if (fromWallet) {
			fromWallet.beforeAvailableBalance = fromWallet.availableBalance
			fromWallet.availableBalance = new BigNumber(fromWallet.availableBalance).minus(new BigNumber(amount)).toString()
			fromWallet.beforeLockedBalance = fromWallet.lockedBalance
			fromWallet.lockedBalance = new BigNumber(fromWallet.lockedBalance).plus(new BigNumber(amount)).toString()
			// fromWallet.updatedAt = BigInt(moment().unix())
			await this.walletService.update(fromWallet)
		}
		if (refId) {
			const existingTxn = await this.findFirst({ refId })
			if (existingTxn) {
				this.logger.log({
					message: 'Transaction already exist',
					transaction,
				})
				throw new BadRequestException('Transaction already exist')
			}
		}
		const txn = await this.create({
			id: randomUUID(),
			fromUserId,
			toUserId,
			refId,
			amount: amount,
			actualAmount: amount,
			txnFee: txnFee || '0',
			memo,
			symbol,
			type,
			fromWallet: fromWallet?.id || transaction.fromWallet,
			toWallet: toWallet?.id || transaction.toWallet,
			refTxId: transaction.refTxId,
			status: TransactionStatus.PENDING,
			tokenType: tokenType || TokenType.NATIVE,
			metadata: metaData ? metaData : {},
			updatedAt: moment().toDate(),
			createdAt: moment().toDate(),
		} as Transaction)
		//
		const executeTransaction = await this.processTransaction(txn.id)
		return executeTransaction
		// return txn
	}

	private async processTransaction(id: string) {
		const txn = await this.findById(id)
		if (!txn) {
			this.logger.log({
				message: '[processTransaction] Transaction not found',
				id,
			})
			return
		}

		if (txn.status !== TransactionStatus.PENDING) {
			this.logger.log({
				message: '[processTransaction] Transaction already processed',
				id,
			})
			return
		}

		if (txn.type === TransactionType.DEPOSIT) {
			const toWallet = await this.walletService.findById(txn.toWallet)
			if (!toWallet) {
				this.logger.log({
					message: '[processTransaction] To Wallet not found',
					id,
				})
				return
			}
			toWallet.beforeAvailableBalance = toWallet.availableBalance
			toWallet.availableBalance = new BigNumber(toWallet.availableBalance).plus(new BigNumber(txn.amount)).toString()
			toWallet.beforeTotalBalance = toWallet.totalBalance
			toWallet.totalBalance = new BigNumber(toWallet.totalBalance).plus(new BigNumber(txn.amount)).toString()

			txn.status = TransactionStatus.SUCCESS
			await this.walletService.update(toWallet)
			await this.update(txn)
			return txn
		} else if (txn.type === TransactionType.TRANSFER) {
			const fromWallet = await this.walletService.findById(txn.fromWallet)
			const toWallet = await this.walletService.findById(txn.toWallet)
			if (!fromWallet || !toWallet) {
				this.logger.log({
					message: '[processTransaction] Wallet not found',
					id,
				})
				return
			}
			fromWallet.beforeLockedBalance = fromWallet.lockedBalance
			fromWallet.lockedBalance = new BigNumber(fromWallet.lockedBalance).minus(new BigNumber(txn.amount)).toString()
			fromWallet.beforeTotalBalance = fromWallet.totalBalance
			fromWallet.totalBalance = new BigNumber(fromWallet.totalBalance).minus(new BigNumber(txn.amount)).toString()

			toWallet.beforeAvailableBalance = toWallet.availableBalance
			toWallet.availableBalance = new BigNumber(toWallet.availableBalance).plus(new BigNumber(txn.amount)).toString()
			toWallet.beforeTotalBalance = toWallet.totalBalance
			toWallet.totalBalance = new BigNumber(toWallet.totalBalance).plus(new BigNumber(txn.amount)).toString()

			txn.status = TransactionStatus.SUCCESS
			await this.walletService.update(fromWallet)
			await this.walletService.update(toWallet)
			await this.update(txn)
			return txn
		}
	}
}
