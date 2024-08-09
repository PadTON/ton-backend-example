import { User } from '@prisma/client'

export enum UserStatus {
	ACTIVATED = 'ACTIVATED',
	INACTIVATED = 'INACTIVATED',
	BANNED = 'BANNED',
}

export enum UserRole {
	USER = 'USER',
	LEADER = 'LEADER',
	ADMIN = 'ADMIN',
	STAFF = 'STAFF',
}

export enum UserProvider {
	PASSWORD = 'PASSWORD',
	WALLET = 'WALLET',
	GOOGLE = 'GOOGLE',
}

export class UserEntity {
	id?: string

	identifier?: string

	status?: UserStatus

	firstName?: string

	lastName?: string

	telegramUsername?: string

	allowsWriteToPm?: boolean

	languageCode?: string

	telegramId?: string

	walletAddress?: string

	signedInAt?: Date

	signedUpAt?: Date

	verifiedAt?: Date

	createdAt?: Date

	updatedAt?: Date

	password?: string

	premiumId?: string

	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial)
	}

	static fromModel(prisma: User): UserEntity {
		return new UserEntity({
			id: prisma.id,
			identifier: prisma.identifier,
			status: <UserStatus>prisma.status,
			signedInAt: prisma.signedInAt,
			signedUpAt: prisma.signedUpAt,
			verifiedAt: prisma.verifiedAt,
			createdAt: prisma.createdAt,
			updatedAt: prisma.updatedAt,
			firstName: prisma.firstName,
			lastName: prisma.lastName,
			telegramUsername: prisma.telegramUsername,
			allowsWriteToPm: prisma.allowsWriteToPm,
			telegramId: prisma.telegramId,
			walletAddress: prisma.walletAddress,
			password: prisma.password,
			// premiumId: prisma.premiumId,
		})
	}

	static toModel(entity: UserEntity): User {
		const signedInAt = entity.signedInAt ? entity.signedInAt : undefined
		const signedUpAt = entity.signedUpAt ? entity.signedUpAt : undefined
		const verifiedAt = entity.verifiedAt ? entity.verifiedAt : undefined
		const createdAt = entity.createdAt ? entity.createdAt : undefined
		const updatedAt = entity.updatedAt ? entity.updatedAt : undefined

		return {
			id: entity.id,
			status: entity.status,
			signedInAt: signedInAt,
			signedUpAt: signedUpAt,
			identifier: entity.identifier,
			verifiedAt: verifiedAt,
			createdAt: createdAt,
			updatedAt: updatedAt,
			firstName: entity.firstName,
			lastName: entity.lastName,
			telegramUsername: entity.telegramUsername,
			allowsWriteToPm: entity.allowsWriteToPm,
			languageCode: entity.languageCode,
			telegramId: entity.telegramId,
			walletAddress: entity.walletAddress,
			password: entity.password,
			// premiumId: entity.premiumId,
		}
	}
}

export interface StateUserEntity {
	isEnableTwoFactor: boolean
	email: string
	user_id: string
	email_verified: boolean
}
