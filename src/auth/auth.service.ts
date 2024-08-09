import { BadRequestException, CACHE_MANAGER, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
import * as crypto from 'crypto'
import * as JWT from 'jsonwebtoken'
import * as moment from 'moment'
import { totp } from 'otplib'
import * as randomstring from 'randomstring'
import { REDIS_PREFIX } from 'src/constants'

import { UserEntity, UserStatus } from 'src/users/entities'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import { UtilsService } from 'src/utils/utils.service'

import { AuthErrorMessage, EmailVerificationErrorMessage } from './constants'
import { AuthUserEntity, ConfirmUserEvent } from './entities'
import {
	AUTH_REPOSITORY,
	IAuthRepository,
	IAuthService,
	JSON_WEB_TOKEN_SERVICE,
	JwtOtpTwoFactorPayload,
	JwtResetPwdBody,
	TimeBaseOtpOptions,
} from './interfaces'
import { JsonWebTokenService } from './jwt.service'

interface InitData {
	query_id: string
	user: string
	auth_date: string
	hash: string
	[key: string]: string // This allows for any other parameters
}
@Injectable()
export class AuthService implements IAuthService {
	private readonly refreshTokenTtl: number

	private readonly signTimeToLive: number

	private readonly prefixLoginCode: string

	private readonly logger = new Logger(AuthService.name)

	private readonly resetPwdTokenPrivateKey: string

	private readonly expiredInResetPwd: string

	private readonly redisResetPwdTtl: number

	private readonly twoFactorTokenExpiredIn: number

	private readonly authSalt: string

	private readonly tOTPDigits: number

	private readonly tOTPStepTime: number

	private readonly codeEmailVerificationExpiredIn: number

	private readonly jwtExpiredIn: string

	private readonly telegramBotToken: string

	constructor(
		@Inject(AUTH_REPOSITORY)
		private readonly authRepository: IAuthRepository,

		@Inject(CACHE_MANAGER)
		private readonly cacheService: Cache,

		private readonly utilsService: UtilsService,

		@Inject(JSON_WEB_TOKEN_SERVICE)
		private readonly jsonWebTokenService: JsonWebTokenService,

		@Inject(USER_SERVICES)
		private readonly userService: IUserService,

		private readonly configService: ConfigService,
	) {
		this.resetPwdTokenPrivateKey = this.configService.get<string>('RESET_PASSWORD_PRIVATE_KEY')
		this.expiredInResetPwd = this.configService.get<string>('EXPIRED_IN_RESET_PASSWORD')
		this.redisResetPwdTtl = this.configService.get<number>('REDIS_RESET_PASSWORD_TTL')
		this.twoFactorTokenExpiredIn = this.configService.get<number>('TWO_FACTOR_TOKEN_EXPIRED_IN')
		this.authSalt = this.configService.get<string>('AUTH_SALT')
		this.tOTPDigits = this.configService.get<number>('NUMBER_DIGITS')
		this.tOTPStepTime = this.configService.get<number>('TLS_VERIFICATION_CODE')
		this.codeEmailVerificationExpiredIn = this.configService.get<number>('CODE_EMAIL_VERIFICATION_EXPIRED_IN')
		this.jwtExpiredIn = this.configService.get<string>('JWT_EXPIRED_IN') || '1440'
		this.signTimeToLive = this.configService.get<number>('REDIS_WALLET_SIGN_TTL')
		this.prefixLoginCode = this.configService.get<string>('PREFIX_WALLET_LOGIN_CODE')
		this.refreshTokenTtl = this.configService.get<number>('REFRESH_TOKEN_TTL') || 604800
		this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN')
	}
	userSignUp(user: UserEntity): Promise<UserEntity> {
		throw new Error('Method not implemented.')
	}

	async adminSignIn(identifier: string, password: string): Promise<AuthUserEntity> {
		const user = await this.authRepository.adminSignIn(identifier, password)
		if (!user) {
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		if (user.isAdmin !== true) {
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		if (user.status !== UserStatus.ACTIVATED) {
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		const payload = {
			id: user.id,
			isAdmin: true,
			role: user.role,
			iat: moment().unix(),
		}
		const token = await this.jsonWebTokenService.signJwt(payload, { expiresIn: this.jwtExpiredIn })
		user.idToken = token
		user.refreshToken = await this.generateNewRefreshToken(user.id)
		return user
	}
	resetPassword(token: string, newPassword: string): Promise<void> {
		throw new Error('Method not implemented.')
	}

	private async getUserIdFromRefreshToken(refreshToken: string): Promise<string> {
		const userId = await this.cacheService.get(`refresh_token:token:${refreshToken}`)
		return String(userId)
	}

	private async generateNewRefreshToken(userId: string): Promise<string> {
		try {
			const refreshToken = randomstring.generate(64)
			await this.cacheService.set(`refresh_token:token:${refreshToken}`, userId, {
				ttl: this.refreshTokenTtl,
			})
			try {
				await this.deleteRefreshToken(userId)
			} catch (error) {
				this.logger.error(error)
			}
			await this.cacheService.set(`refresh_token:user:${userId}`, refreshToken, {
				ttl: this.refreshTokenTtl,
			})
			return refreshToken
		} catch (e) {
			console.log(`Generate new refresh token error: ${e}`)
			return ''
		}
	}

	private async deleteRefreshToken(userId: string): Promise<void> {
		try {
			const refreshToken = await this.cacheService.get(`refresh_token:user:${userId}`)
			if (refreshToken) {
				await this.cacheService.set(`refresh_token:token:${refreshToken}`, userId, {
					ttl: 60,
				})
			}
		} catch (e) {
			console.log(`Delete refresh token error: ${e}`)
		}
	}

	verifyCodeEmail(user: AuthUserEntity, opt: string): boolean {
		const secretKey = this.generateSecretKey(user)
		return this.verifyTimeBaseOTP(secretKey, opt)
	}

	private getKeyRedisSendCodeVerifyEmail(user: AuthUserEntity) {
		return `email_code_verification_sent:${user.id}`
	}

	async sendEmailVerification(user: AuthUserEntity): Promise<boolean> {
		const redisKey = this.getKeyRedisSendCodeVerifyEmail(user)
		const isSentEmail = await this.cacheService.get(redisKey)
		if (isSentEmail) throw new BadRequestException(EmailVerificationErrorMessage.EMAIL_HAS_BEEN_SENT)

		const code = this.generateTimeBaseOTP(user, {
			digits: this.tOTPDigits,
			stepTime: this.codeEmailVerificationExpiredIn,
		})
		const payload: ConfirmUserEvent = {
			code,
			nickName: user.nickName,
		}
		await this.cacheService.set(redisKey, true, { ttl: this.codeEmailVerificationExpiredIn })
		return true
	}

	generateSecretKey(payload: AuthUserEntity): string {
		return `${JSON.stringify(payload)}${this.authSalt}`
	}

	verifyTimeBaseOTP(secretKey: string, otp: string): boolean {
		return totp.check(otp, secretKey)
	}

	generateTimeBaseOTP(payload: AuthUserEntity, options?: TimeBaseOtpOptions): string {
		totp.options = {
			digits: options && options.digits ? Number(options.digits) : Number(this.tOTPDigits),
			step: options && options.stepTime ? Number(options.stepTime) : Number(this.tOTPStepTime),
		}
		const secretKey = this.generateSecretKey(payload)
		return totp.generate(secretKey)
	}

	generateTwoFactorToken(user: UserEntity, verifiedData: JwtOtpTwoFactorPayload): Promise<string> {
		const payload: any = {
			id: user.id,
			iat: moment().unix(),
			exp: moment()
				.add(this.twoFactorTokenExpiredIn * 1000, 'milliseconds')
				.unix(),
			...verifiedData,
		}
		return this.jsonWebTokenService.sign(payload)
	}

	generateOtpToken(payload: any): Promise<string> {
		return this.jsonWebTokenService.sign(payload)
	}

	private genResetPasswordKey(email: string) {
		return `${REDIS_PREFIX}:reset-password:${email}`
	}

	generateTokenResetPassword(email: string): string {
		const body: JwtResetPwdBody = { email }
		return JWT.sign(body, this.resetPwdTokenPrivateKey, { expiresIn: this.expiredInResetPwd })
	}

	async sendEmailResetPassword(user: UserEntity): Promise<boolean> {
		return true
	}

	async refreshToken(refreshToken: string): Promise<AuthUserEntity> {
		const userId = await this.getUserIdFromRefreshToken(refreshToken)
		if (!userId) {
			console.log('invalid refresh token')
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		const user = await this.authRepository.findUserById(userId)
		if (!user) {
			console.log('invalid user id ', userId)
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		const payload = {
			id: user.id,
			isAdmin: user.isAdmin,
			iat: moment().unix(),
		}
		if (user.isAdmin) {
			payload['role'] = user.role
		}
		const newToken = await this.jsonWebTokenService.signJwt(payload, { expiresIn: this.jwtExpiredIn })
		user.idToken = newToken
		user.refreshToken = await this.generateNewRefreshToken(user.id)
		return user
	}

	async adminSignUp(user: AuthUserEntity): Promise<AuthUserEntity> {
		return await this.authRepository.adminCreateUser(user)
	}

	async verifyUser(code: string): Promise<UserEntity> {
		if (!code) throw new BadRequestException(AuthErrorMessage.INVALID_TWO_FACTOR)
		const user = await this.userService.findOne({ otp_code: code })
		if (!user) throw new BadRequestException(AuthErrorMessage.INVALID_TWO_FACTOR)

		return await this.userService.update(user.id, {
			verifiedAt: moment().toDate(),
		})
	}

	private generateNonce(): number {
		return this.utilsService.generateNonce()
	}

	async createUserViaWallet(address: string): Promise<number> {
		const user = await this.userService.findById(address)
		if (!user) {
			const newUser = new UserEntity({ id: address, verifiedAt: moment().toDate() })

			const userCreated = await this.authRepository.userCreateUser(newUser)
		}

		const nonce = this.generateNonce()
		await this.cacheService.set(address, nonce, { ttl: this.signTimeToLive })
		return nonce
	}

	async signWallet(address: string, signature: string): Promise<AuthUserEntity> {
		const user = await this.userService.findById(address)
		if (!user) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)

		const nonce = await this.cacheService.get(user.id)
		const msg = `${this.prefixLoginCode}${nonce}`
		const isValid = this.utilsService.isSignatureValid(msg, address, signature)
		if (!isValid) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)

		return AuthUserEntity.fromUserEntity(user)
	}

	async generateJWTToken(user: UserEntity): Promise<AuthUserEntity> {
		const payload = {
			id: user.id,
			telegramId: user.telegramId,
			iat: moment().unix(),
		}
		const token = await this.jsonWebTokenService.signJwt(payload, { expiresIn: this.jwtExpiredIn })
		const authUser = AuthUserEntity.fromUserEntity(user)
		authUser.password = undefined
		authUser.idToken = token
		authUser.refreshToken = await this.generateNewRefreshToken(user.id)
		return authUser
	}

	async signInMiniApp(initData: string): Promise<AuthUserEntity> {
		const data = this.parseInitData(initData)
		// Extract the hash from the initData
		const { hash, ...dataWithoutHash } = data
		// Create an array of key=value strings sorted by key
		const sortedData = Object.keys(dataWithoutHash)
			.sort()
			.map((key) => `${key}=${dataWithoutHash[key]}`)
			.join('\n')

		const secretKey = crypto.createHmac('sha256', 'WebAppData').update(this.telegramBotToken).digest()
		const hashCheck = crypto.createHmac('sha256', secretKey).update(sortedData).digest('hex')
		this.logger.debug({
			hash,
			hashCheck,
			sortedData,
		})
		if (hash !== hashCheck) {
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		console.log(`Data: ${JSON.stringify(data)}`)
		const extractedUser = JSON.parse(data.user)
		const refCode = data?.start_param || ''
		console.log(refCode)
		if (!extractedUser || !extractedUser.id) {
			throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		}
		const uniqueId = crypto.createHmac('sha256', 'WebAppData').update(String(extractedUser.id)).digest('hex')
		let user = await this.userService.findById(uniqueId)
		if (!user) {
			const newUser = new UserEntity({
				id: uniqueId,
				identifier: String(extractedUser.id),
				verifiedAt: moment().toDate(),
				signedInAt: moment().toDate(),
				createdAt: moment().toDate(),
				updatedAt: moment().toDate(),
				signedUpAt: moment().toDate(),
				telegramId: String(extractedUser.id),
				firstName: extractedUser.first_name,
				lastName: extractedUser.last_name,
				allowsWriteToPm: extractedUser.allows_write_to_pm,
				telegramUsername: extractedUser.username,
				languageCode: extractedUser.language_code,
			})
			user = await this.userService.create(newUser)
		}

		return await this.generateJWTToken(user)
	}

	parseInitData(initData: string): InitData {
		const params = new URLSearchParams(initData)
		const data: { [key: string]: string } = {}

		params.forEach((value, key) => {
			data[key] = value
		})

		return data as InitData
	}
}
