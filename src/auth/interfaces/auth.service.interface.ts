import { UserEntity } from 'src/users/entities'
import { AuthUserEntity } from '../entities/user.entity'
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server/script/deps'

export interface TimeBaseOtpOptions {
	digits: number
	stepTime: number
}
export interface JwtOtpTwoFactorPayload {
	id?: string
	exp?: number
	iat?: number
	isEnableTwoFactor?: boolean
	isVerifiedTwoFactor?: boolean
	isVerifiedEmailOTP?: boolean
}
export interface JwtResetPwdBody {
	email: string
}
export interface IAuthService {
	userSignUp(user: UserEntity): Promise<UserEntity>

	createUserViaWallet(address: string): Promise<number>

	signWallet(address: string, signature: string): Promise<AuthUserEntity>

	verifyUser(code: string): Promise<UserEntity>

	adminSignUp(user: AuthUserEntity): Promise<AuthUserEntity>

	adminSignIn(identifier: string, password: string): Promise<AuthUserEntity>

	sendEmailResetPassword(user: UserEntity): Promise<boolean>

	resetPassword(token: string, newPassword: string): Promise<void>

	generateOtpToken(payload: any): Promise<string>

	generateTwoFactorToken(user: UserEntity, verifiedData: any): Promise<string>

	generateTimeBaseOTP(payload: AuthUserEntity, options?: TimeBaseOtpOptions): string

	verifyTimeBaseOTP(secretKey: string, otp: string): boolean

	sendEmailVerification(user: AuthUserEntity): Promise<boolean>

	verifyCodeEmail(user: AuthUserEntity, otp: string): boolean

	generateJWTToken(user: UserEntity): Promise<AuthUserEntity>

	refreshToken(token: string): Promise<AuthUserEntity>

	signInMiniApp(data: string): Promise<AuthUserEntity>
}

export const AUTH_SERVICE = 'AUTH SERVICE'
