import { ApiProperty } from '@nestjs/swagger'
import { UserEntity, UserStatus } from 'src/users/entities'

export enum AuthUserStatus {
	ACTIVED = 'ACTIVED',
	INACTIVED = 'INACTIVED',
	BANNED = 'BANNED',
}

export enum AuthUserState {
	INIT = 'INIT',
	CREATED = 'CREATED',
	UPDATED = 'UPDATED',
}

export class AuthUserEntity {
	@ApiProperty({
		description: 'The user ID',
		example: 'f7b3e3e0-3e3e-4e3e-8e3e-3e3e3e3e3e3e',
	})
	id: string

	identifier: string

	telegramId?: string

	walletAddress?: string

	nickName?: string

	address?: string

	status?: AuthUserStatus | UserStatus

	firstName?: string

	lastName?: string

	birthday?: number

	isAdmin?: boolean

	signedInAt?: Date

	signedUpAt?: Date

	avatar?: string

	state?: AuthUserState

	role?: string[]

	verifiedAt?: Date

	createdAt?: Date

	updatedAt?: Date

	defaultAddress?: string

	isEnableTwoFactor?: boolean

	provider?: string

	password?: string

	twoFactorAuthenticationSecret?: string

	expiresIn?: number

	idToken?: string

	refreshToken?: string

	publicKey?: string

	constructor(partial: Partial<AuthUserEntity>) {
		Object.assign(this, partial)
	}

	static toUserEntity(authUser: AuthUserEntity): UserEntity {
		return {
			id: authUser.id,
			identifier: authUser.identifier,
			telegramId: authUser.telegramId,
			walletAddress: authUser.walletAddress,
			status: <UserStatus>authUser.status,
			signedInAt: authUser.signedInAt,
			signedUpAt: authUser.signedUpAt,
			verifiedAt: authUser.verifiedAt,
			createdAt: authUser.createdAt,
			updatedAt: authUser.updatedAt,
			password: authUser.password,
		}
	}

	static fromUserEntity(user: UserEntity): AuthUserEntity {
		return {
			id: user.id,
			identifier: user.identifier,
			status: <UserStatus>user.status,
			signedInAt: user.signedInAt,
			signedUpAt: user.signedUpAt,
			verifiedAt: user.verifiedAt,
			createdAt: user.createdAt,
			telegramId: user.telegramId,
			walletAddress: user.walletAddress,
			updatedAt: user.updatedAt,
		}
	}
}
