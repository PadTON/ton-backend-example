import { IJsonWebTokenService, JwtKey } from './interfaces'
import * as Jose from 'node-jose'
import * as jwktopem from 'jwk-to-pem'
import * as JWT from 'jsonwebtoken'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { OnModuleInit } from '@nestjs/common'
import * as moment from 'moment'
import { SignOptions } from 'jsonwebtoken'

export class JsonWebTokenService implements IJsonWebTokenService, OnModuleInit {
	private folderKey: string

	private pathKey: string

	constructor(folderKey?: string, fileName?: string) {
		if (!folderKey) {
			folderKey = process.env.JWKS_FOLDER
		}
		if (!folderKey) {
			folderKey = '.jwt'
		}
		if (!fileName) {
			fileName = process.env.JWKS_FILE
		}
		if (!fileName) {
			fileName = 'jwks.json'
		}
		this.folderKey = folderKey
		this.pathKey = `${this.folderKey}/${fileName}`
	}

	onModuleInit() {
		const isExists = existsSync(this.pathKey)
		if (!isExists) this.generateKey()
	}

	async decode(token: string): Promise<any> {
		const key = await this.getKey()
		const [firstKey] = key.keys
		const publicKey = jwktopem(firstKey)
		try {
			const decoded = JWT.verify(token, publicKey)
			return decoded
		} catch (err) {
			throw err
		}
	}

	async getPrivateKey(): Promise<string> {
		const keyFile = readFileSync(this.pathKey)
		const keyStore = await Jose.JWK.asKeyStore(keyFile.toString())
		const [key] = keyStore.all({ use: 'sig' })
		return key.toPEM(true)
	}

	async signJwt(payload: object, options?: SignOptions): Promise<string> {
		return this.sign({
			...payload,
			uid: payload['id'],
			sub: payload['id'],
			exp: moment().add(options.expiresIn, 'minutes').unix(),
		})
	}

	async signJwtWithExp(payload: object, aliveMinues: number, options?: object): Promise<string> {
		return this.sign({
			...payload,
			uid: payload['id'],
			sub: payload['id'],
			exp: moment().add(aliveMinues, 'minutes').unix(),
		})
	}

	async sign(payload: object): Promise<string> {
		const keyFile = readFileSync(this.pathKey)
		const keyStore = await Jose.JWK.asKeyStore(keyFile.toString())
		const [key] = keyStore.all({ use: 'sig' })
		const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } }

		const token = await Jose.JWS.createSign(opt, key)
			.update(Buffer.from(JSON.stringify(payload)))
			.final()
		return token.toString()
	}

	async getKey(): Promise<JwtKey> {
		const keyFile = readFileSync(this.pathKey)
		const keyStore = await Jose.JWK.asKeyStore(keyFile.toString())
		return keyStore.toJSON() as JwtKey
	}

	async generateKey(): Promise<void> {
		const keyStore = Jose.JWK.createKeyStore()
		await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
		const isExists = existsSync(this.folderKey)
		if (!isExists) mkdirSync(this.folderKey)
		return writeFileSync(this.pathKey, JSON.stringify(keyStore.toJSON(true), null, '  '))
	}
}
