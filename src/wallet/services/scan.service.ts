import { Prisma, TokenType, TonScanConfig, TonScanConfigStatus, TransactionStatus, TransactionType, WalletType } from '@prisma/client'
import { BaseService } from 'src/common/base.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ScanConfigRepository } from '../repositories/scanconfig.repository'
import { TransactionService } from './transaction.service'

import { ConfigService } from '@nestjs/config'
import * as moment from 'moment'
import { USER_SERVICES, IUserService } from 'src/users/interfaces/user.service.interface'
import { TransactionDto, TxnSymbol } from '../dto/index.dto'
import BigNumber from 'bignumber.js'
import { TonService } from './ton.service'
import { Address, fromNano, toNano } from '@ton/core'
import { UserEntity } from 'src/users/entities'

// sleep
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

@Injectable()
export class ScanService extends BaseService<TonScanConfig, ScanConfigRepository> {
	private readonly logger = new Logger(ScanService.name)

	private depositWalletAddress: string
	private masterAddressUSDT: string

	private hotWalletAddress: string

	private readonly SCAN_LIMIT = 100

	private readonly DEFAULT_DECIMAL_PLACES = 9

	constructor(
		private repository: ScanConfigRepository,
		private readonly transactionService: TransactionService,
		private readonly configService: ConfigService,
		@Inject(USER_SERVICES)
		private readonly userService: IUserService,
		private readonly tonService: TonService,
	) {
		super()
		this.depositWalletAddress = Address.parse(this.configService.get<string>('WALLET_DEPOSIT_ADDRESS')).toString()
		this.hotWalletAddress = Address.parse(this.configService.get<string>('WALLET_HOT_ADDRESS')).toString()
		this.masterAddressUSDT = Address.parse(this.configService.get<string>('USDT_CONTRACT_ADDRESS')).toString()
	}

	getDefaultRepository(): ScanConfigRepository {
		return this.repository
	}

	buildWhereQuery(queryDto: any) {
		return {}
	}

	private async getFullTransaction(apiClient: any, currentLt: number, address: string) {
		let isContinue = true
		const availableEvents = []
		let continuteLt = 0
		while (isContinue) {
			await sleep(5000)
			let transactions: any = []
			try {
				if (continuteLt > 0) {
					transactions = await apiClient.accounts.getAccountEvents(address, { limit: 50, before_lt: continuteLt })
				} else {
					transactions = await apiClient.accounts.getAccountEvents(address, { limit: 50 })
				}
			} catch (error) {
				this.logger.error(error)
			}

			if (transactions.events.length == 0) {
				isContinue = false
				break
			}

			for (let index = 0; index < transactions.events.length; index++) {
				const element = transactions.events[index]
				if (element.lt === currentLt) {
					isContinue = false
					break
				}
				availableEvents.push(element)
			}
			continuteLt = transactions.events[transactions.events.length - 1].lt
		}
		return availableEvents
	}

	async scanDepositUSDTEvents() {
		const configId = 'deposit'
		const scanConfig = await this.repository.findById(configId)

		if (!scanConfig) {
			this.logger.error('[scanDepositUSDTEvents] Config not found')
			return
		}
		if (scanConfig.status == TonScanConfigStatus.RUNNING) {
			this.logger.error('[scanDepositUSDTEvents] Config is running')
			return
		}
		const currentLt = parseInt(scanConfig.lastLt.toString())
		scanConfig.status = TonScanConfigStatus.RUNNING
		await this.update(scanConfig)
		try {
			const transactions = await this.getFullTransaction(this.tonService.api, currentLt, this.depositWalletAddress)
			this.logger.debug(`[scanDepositUSDTEvents] Scan Action of pool ${this.depositWalletAddress} - ${transactions.length} transaction found`)
			for (let index = 0; index < transactions.length; index++) {
				const element = transactions[index]
				this.logger.log(element)
				const jettonEvent = this.tonService.parseJettonTransferEvent(element)
				this.logger.debug(`jetton event: ${!!jettonEvent}`)
				// this.logger.debug(`[scanDepositUSDTEvents] Recevive USDT Deposit: ${JSON.stringify(jettonEvent)}`)
				if (jettonEvent) {
					if (this.masterAddressUSDT == jettonEvent.tokenAddress) {
						this.logger.debug(`[scanDepositUSDTEvents] Receive USDT Deposit: ${JSON.stringify(jettonEvent)}`)
						let existedUser: UserEntity = null
						existedUser = await this.userService.findByWalletAddress(jettonEvent.fromAddress)
						if (!existedUser) {
							if (jettonEvent.comment) {
								existedUser = await this.userService.findById(jettonEvent.comment)
							}
						}
						if (existedUser) {
							this.logger.debug(`[scanDepositUSDTEvents] Got deposit from user ${existedUser.telegramUsername}`)
							try {
								const depositData: TransactionDto = {
									toUserId: existedUser.id,
									tokenType: TokenType.JETTON,
									symbol: TxnSymbol.USDT,
									type: TransactionType.DEPOSIT,
									amount: new Prisma.Decimal(jettonEvent.amount).div(10e5).toString(),
									fromWalletType: WalletType.SYSTEM,
									toWalletType: WalletType.USER,
									fromWallet: `external_${jettonEvent.fromAddress}`,
									refId: jettonEvent.eventId,
									metaData: { eventId: jettonEvent.eventId },
								}
								await this.transactionService.submitTransaction(depositData)
							} catch (error) {
								this.logger.error(`submit transaction error: ${error?.toString()}`)
							}
						}
					}
				}
			}
			scanConfig.status = TonScanConfigStatus.ACTIVE
			if (transactions.length > 0) {
				scanConfig.lastLt = BigInt(transactions[0].lt.toString())
			}
			await this.update(scanConfig)
		} catch (error) {
			scanConfig.status = TonScanConfigStatus.ACTIVE
			await this.update(scanConfig)
			this.logger.error(`[scanDepositUSDTEvents] Error: ${error}`)
		}
	}

	async processWithdrawTransaction() {
		this.logger.debug('[processWithdrawTransaction] started')
		const configId = 'withdraw'
		const scanConfig = await this.repository.findById(configId)

		if (!scanConfig) {
			this.logger.error('[scanDepositUSDTEvents] Config not found')
			return
		}
		if (scanConfig.status == TonScanConfigStatus.RUNNING) {
			this.logger.error('[scanDepositUSDTEvents] Config is running')
			return
		}
		const availableWithdraws = await this.transactionService.findAll(
			{ page: 1, pageSize: 10, skip: 0, order: 'createdAt asc' },
			{ status: TransactionStatus.PENDING, type: TransactionType.WITHDRAW, order: 'createdAt asc' },
		)
		this.logger.debug(`[processWithdrawTransaction] Available withdraws: ${JSON.stringify(availableWithdraws.data)}`)
		if (availableWithdraws.data.length > 0) {
			scanConfig.status = TonScanConfigStatus.RUNNING
			await this.update(scanConfig)
			const withdrawTran = availableWithdraws.data[0]
			try {
				this.logger.debug(`[processWithdraw] Withdraw ${withdrawTran.id} - ${withdrawTran.actualAmount} - ${withdrawTran.toWallet}`)
				const isSuccess = await this.tonService.transferJettonToken(
					withdrawTran.toWallet,
					this.tonService.getUsdtTokenAddress(),
					toNano(withdrawTran.amount.toString()).toString(),
					withdrawTran.id,
				)
				this.logger.debug(`[processWithdraw] Withdraw ${withdrawTran.id} - ${isSuccess}`)
				if (isSuccess) {
					withdrawTran.refId = withdrawTran.id
					withdrawTran.status = TransactionStatus.PROCESSING
					await this.transactionService.update(withdrawTran)
				}
				scanConfig.status = TonScanConfigStatus.ACTIVE
				await this.update(scanConfig)
			} catch (error) {
				this.logger.error(`[processWithdraw] Withdraw ${withdrawTran.id} - ${error}`)
				withdrawTran.status = TransactionStatus.FAILED
				withdrawTran.metadata['error'] = error.toString()
				await this.transactionService.update(withdrawTran)
				scanConfig.status = TonScanConfigStatus.ACTIVE
				await this.update(scanConfig)
			}
		}
	}

	async verifyWithdrawTransaction() {
		const configId = 'verifyWithdraw'
		const scanConfig = await this.repository.findById(configId)

		if (!scanConfig) {
			this.logger.error('[verifyWithdrawTransaction] Config not found')
			return
		}
		if (scanConfig.status == TonScanConfigStatus.RUNNING) {
			this.logger.error('[verifyWithdrawTransaction] Config is running')
			return
		}

		const processingWithdraws = await this.transactionService.findAll(
			{ page: 1, pageSize: 10, skip: 0 },
			{ status: TransactionStatus.PROCESSING },
		)
		this.logger.log(`[verifyWithdrawTransaction] Processing withdraws: ${processingWithdraws.data.length}`)
		if (processingWithdraws.data.length == 0) {
			this.logger.log('[verifyWithdrawTransaction] No withdraw processing')
			return
		}

		const currentLt = parseInt(scanConfig.lastLt.toString())
		scanConfig.status = TonScanConfigStatus.RUNNING
		await this.update(scanConfig)

		try {
			const transactions = await this.getFullTransaction(this.tonService.api, currentLt, this.hotWalletAddress)
			this.logger.log(`[verifyWithdrawTransaction] Scan Action of pool ${this.hotWalletAddress} - ${transactions.length} transaction found`)
			for (let index = 0; index < transactions.length; index++) {
				const element = transactions[index]
				const jettonEvent = this.tonService.parseJettonTransferEvent(element)
				// this.logger.debug(`[scanDepositUSDTEvents] Recevive USDT Deposit: ${JSON.stringify(jettonEvent)}`)
				if (jettonEvent) {
					if (this.masterAddressUSDT == jettonEvent.tokenAddress && jettonEvent.fromAddress == this.hotWalletAddress) {
						this.logger.log(`[verifyWithdrawTransaction] Receive USDT Withdraw: ${JSON.stringify(jettonEvent)}`)
						if (jettonEvent.comment) {
							const existedTran = await this.transactionService.findFirst({ refId: jettonEvent.comment })
							if (existedTran) {
								if (existedTran.status == TransactionStatus.PROCESSING) {
									existedTran.status = TransactionStatus.SUCCESS
									existedTran.metadata['eventId'] = jettonEvent.eventId
									await this.transactionService.update(existedTran)
									this.logger.debug(
										`[verifyWithdrawTransaction] Withdraw ${existedTran.id} - ${existedTran.actualAmount} - ${existedTran.toWallet} - ${existedTran.status}`,
									)
								}
							}
						} else {
							this.logger.debug('[verifyWithdrawTransaction] This is not withdraw from system')
						}
					}
				}
			}
			scanConfig.status = TonScanConfigStatus.ACTIVE
			if (transactions.length > 0) {
				// scanConfig.lastLt = BigInt(transactions[0].lt.toString())
			}
			await this.update(scanConfig)
		} catch (error) {
			scanConfig.status = TonScanConfigStatus.ACTIVE
			await this.update(scanConfig)
			this.logger.error(`[verifyWithdrawTransaction] Error: ${error}`)
		}
	}

	private async findUserByWalletAddressOrId(id: string, address: string) {
		let user = await this.userService.findById(id)
		if (!user) {
			user = await this.userService.findByWalletAddress(address)
		}
		return user
	}
}
