import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KeyPair, mnemonicToPrivateKey } from '@ton/crypto'
import { Address, JettonMaster, OpenedContract, TonClient, WalletContractV4, beginCell, internal, toNano } from '@ton/ton'
import { AccountEvent, Api, HttpClient } from 'tonapi-sdk-js'

export const Opcodes = {
	intPool: 12,
	transferJettonToken: 0xf8a7ea5,
}

export interface IJettonTransferTransacton {
	fromAddress: string
	toAddress: string
	amount: string
	tokenAddress: string
	symbol: string
	eventId: string
	comment?: string
}

@Injectable()
export class TonService {
	private readonly logger = new Logger(TonService.name)
	private tonClient: TonClient
	public api: Api<unknown>
	private hotWalletAddress: string
	constructor(private readonly configService: ConfigService) {
		this.tonClient = new TonClient({
			endpoint: `${this.configService.get<string>('TON_CENTER_API_BASE_URL')}/jsonRPC`,
			apiKey: this.configService.get<string>('TON_CENTER_API_KEY'),
		})
		this.hotWalletAddress = this.configService.get<string>('WALLET_HOT_ADDRESS')

		const httpClient = new HttpClient({
			baseUrl: this.configService.get<string>('TON_CONSOLE_API_BASE_URL'),
			baseApiParams: {
				headers: {
					Authorization: `Bearer ${this.configService.get<string>('TON_CONSOLE_API_KEY')}`,
					'Content-Type': 'application/json',
				},
			},
		})
		this.api = new Api(httpClient)
	}

	private async getWalletKeyPair(): Promise<KeyPair> {
		const mnemonic = this.configService.get<string>('WALLET_HOT_SEED_PHRASE').split(' ')
		const keyPair = await mnemonicToPrivateKey(mnemonic)
		return keyPair
	}

	private async createWalletContract(keyPair: KeyPair): Promise<OpenedContract<WalletContractV4>> {
		const workchain = 0
		const wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey })
		const contract = this.tonClient.open(wallet)
		return contract
	}

	async transferNativeToken(toAddress: string, amount: string, memo?: string) {
		const keyPair = await this.getWalletKeyPair()
		const contract = await this.createWalletContract(keyPair)
		const balance = await contract.getBalance()
		const transferAmount = toNano(Number(amount))
		let isSuccessful = false
		this.logger.log({
			message: `Transfer ${amount} TON to ${toAddress}`,
			toAddress,
			amount,
			memo,
			balance,
			transferAmount,
		})
		if (transferAmount > Number(balance)) {
			throw new Error('Insufficient balance')
		}
		const seqno = await contract.getSeqno()
		const transfer = await contract.sendTransfer({
			seqno,
			secretKey: keyPair.secretKey,
			messages: [
				internal({
					value: transferAmount,
					to: toAddress,
					body: memo || '',
				}),
			],
		})
		this.logger.log({
			message: 'Transfer TON',
			transfer,
		})
		isSuccessful = true
		return isSuccessful
	}

	parseJettonTransferEvent(event: AccountEvent): IJettonTransferTransacton {
		if (event.actions.length > 0) {
			const firstAction = event.actions[0]
			if (firstAction.type === 'JettonTransfer' && firstAction.status == 'ok' && !event.in_progress) {
				return {
					fromAddress: Address.parse(firstAction.JettonTransfer.sender.address).toString(),
					toAddress: Address.parse(firstAction.JettonTransfer.recipient.address).toString(),
					amount: firstAction.JettonTransfer.amount,
					tokenAddress: Address.parse(firstAction.JettonTransfer.jetton.address).toString(),
					symbol: firstAction.JettonTransfer.jetton.symbol,
					eventId: event.event_id,
					comment: firstAction.JettonTransfer.comment ? firstAction.JettonTransfer.comment : null,
				}
			}
		}
		return null
	}

	async transferJettonToken(toAddress: string, tokenAddress: string, amount: string, memo?: string) {
		const jettonContract = this.tonClient.open(JettonMaster.create(Address.parse(tokenAddress)))
		const fromJettonWalletAddress = await jettonContract.getWalletAddress(Address.parse(this.hotWalletAddress))

		const jettonBalance = await this.api.accounts.getAccountJettonBalance(this.hotWalletAddress, tokenAddress)
		let isSuccessful = false
		this.logger.log({
			message: `Transfer ${amount} USDT to ${toAddress}`,
			toAddress,
			tokenAddress,
			amount,
			memo,
			hotWalletAddress: this.hotWalletAddress,
			fromJettonWalletAddress,
			availableBalance: jettonBalance.balance,
		})
		if (Number(amount) > Number(jettonBalance.balance)) {
			throw new Error('Insufficient balance')
		}
		const keyPair = await this.getWalletKeyPair()
		const contract = await this.createWalletContract(keyPair)
		const provider = this.tonClient.provider(fromJettonWalletAddress)
		const sender = contract.sender(keyPair.secretKey)
		const forwardPayload = beginCell()
			.storeUint(0, 32) // 0 opcode means we have a comment
			.storeStringTail(memo || '')
			.endCell()
		const messageBody = beginCell()
			.storeUint(Opcodes.transferJettonToken, 32)
			.storeUint(0, 64)
			.storeCoins(toNano('1'))
			.storeAddress(Address.parse(toAddress))
			.storeAddress(Address.parse(this.hotWalletAddress))
			.storeBit(0)
			.storeCoins(toNano(0.01))
			.storeBit(1)
			.storeRef(forwardPayload)
			.endCell()
		await provider.internal(sender, { value: '0.08', body: messageBody })
		isSuccessful = true
		return isSuccessful
	}

	getUsdtTokenAddress() {
		return this.configService.get<string>('USDT_CONTRACT_ADDRESS')
	}

	async getAccountEvents(
		address: string,
		query: {
			/**
			 * Show only events that are initiated by this account
			 * @default false
			 */
			initiator?: boolean
			/**
			 * filter actions where requested account is not real subject (for example sender or receiver jettons)
			 * @default false
			 */
			subject_only?: boolean
			/**
			 * omit this parameter to get last events
			 * @format int64
			 * @example 25758317000002
			 */
			before_lt?: number
			/**
			 * @min 1
			 * @max 100
			 * @example 20
			 */
			limit: number
			/**
			 * @format int64
			 * @example 1668436763
			 */
			start_date?: number
			/**
			 * @format int64
			 * @example 1668436763
			 */
			end_date?: number
		},
	) {
		const events = await this.api.accounts.getAccountEvents(address, query)
		return events
	}
}
