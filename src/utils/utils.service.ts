import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosRequestConfig } from 'axios'
import * as ethUtil from 'ethereumjs-util'
import * as sigUtil from 'eth-sig-util'
import * as crypto from 'crypto'
import BigNumber from 'bignumber.js'
@Injectable()
export class UtilsService {
	private readonly numberDigit: number
	constructor(private readonly configService: ConfigService) {
		this.numberDigit = Number(this.configService.get<string>('NUMBER_DIGITS'))
	}

	generateNonce(): number {
		return Math.floor(Math.random() * 1_000_000)
	}

	async getSecretAuthKey(key: string): Promise<string> {
		const res = await axios.get(this.configService.get('LINK_GET_JWT_TOKEN'), {
			headers: {
				'Cache-Control': 'max-age',
			},
		})
		const data = res.data
		const keys = Object.keys(data)
		const values = Object.values(data)
		return values[keys.indexOf(key)].toString()
	}
	getDateFromUnixTimestamp(timestamp: number): Date {
		return new Date(timestamp * 1000)
	}

	isWalletAddress(address: string): boolean {
		return ethUtil.isValidAddress(address)
	}

	public isSignatureValid(msg: string, publicAddress: string, signature: string): boolean {
		const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'))
		const address = sigUtil.recoverPersonalSignature({
			data: msgBufferHex,
			sig: signature,
		})
		return address.toLowerCase() === publicAddress.toLowerCase()
	}

	public async verifyHcaptcha(clientToken: string): Promise<boolean> {
		try {
			const options: AxiosRequestConfig = {
				url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				data: `response=${clientToken}&secret=${this.configService.get('HCAPTCHA_SECRET')}`,
			}
			const resp = await axios.request(options)
			if (resp.data.success === true) {
				return true
			}
			console.log('captcha verify resp', resp)
			return false
		} catch (e) {
			console.log(`verifycaptcha error: ${e}`)
			return false
		}
	}

	public uint8ArrayToBase64(uint8Array: Uint8Array): string {
		return Buffer.from(uint8Array).toString('base64')
	}

	public base64ToUint8Array(base64: string): Uint8Array {
		return new Uint8Array(Buffer.from(base64, 'base64'))
	}

	public getHash(id: string): string {
		return crypto.createHash('sha256').update(id).digest('hex')
	}

	public timeToSeconds(time: string): number {
		const parts = time.split(':').map(Number)
		let seconds = 0

		if (parts.length === 3) {
			// If time is in HH:mm:ss format
			seconds += parts[0] * 3600 // hours to seconds
			seconds += parts[1] * 60 // minutes to seconds
			seconds += parts[2] // seconds
		} else if (parts.length === 2) {
			// If time is in HH:mm format
			seconds += parts[0] * 3600 // hours to seconds
			seconds += parts[1] * 60 // minutes to seconds
		}

		return seconds
	}

	public decimalPlaceAmount(amount: string | number): string {
		return new BigNumber(amount).decimalPlaces(this.numberDigit, BigNumber.ROUND_FLOOR).toString()
	}
}
