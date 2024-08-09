export interface UserEntity {
	id: string
}
export interface BaseRequest extends Request {
	user?: UserEntity
	twoFactorVerified?: ITwoFactorPayload
}

export interface ITwoFactorPayload {
	userId?: string
	isEnableTwoFactor?: boolean
	isVerifiedEmailOTP?: boolean
	isVerifiedTwoFactor?: boolean
}

export const BASE_REPOSITORY = 'BASE REPOSITORY'
