import { Prisma, UserStatus } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { decamelize } from 'humps'
export class UserQueryDto {
	@IsString()
	@IsOptional()
	id?: string

	@IsString()
	@IsOptional()
	ids?: string

	@IsString()
	@IsOptional()
	walletAddress?: string

	@IsOptional()
	@Transform((params) => (params.value?.length > 0 ? params.value : undefined))
	email?: string

	@IsEnum(UserStatus)
	@IsOptional()
	status?: string

	// @IsNumber()
	// @Type(() => Number)
	@IsDate()
	@IsOptional()
	signedInFrom?: Date

	// @IsNumber()
	// @Type(() => Number)
	@IsDate()
	@IsOptional()
	signedInTo?: Date

	// @IsNumber()
	// @Type(() => Number)
	@IsDate()
	@IsOptional()
	signedUpFrom?: Date

	// @IsNumber()
	// @Type(() => Number)
	@IsDate()
	@IsOptional()
	signedUpTo?: Date

	@IsString()
	@IsOptional()
	defaultAddress?: string

	@IsString()
	@IsOptional()
	identifiers?: string

	@IsOptional()
	orders?: string[] | string

	@IsOptional()
	emailUnique?: string

	@IsOptional()
	isAdmin?: string

	@IsOptional()
	otp_code?: string
}

export class WhereUser {
	orders: any = []
	query: any = {}
	whereId: any = {}
	whereIds: any = {}
	whereEmail: any = {}
	whereStatus: any = {}
	whereSignInFrom: any = {}
	whereSignInTo: any = {}
	whereSignUpFrom: any = {}
	whereSignUpTo: any = {}
	whereAddress: any = {}
	whereDefaultAddress: any = {}
	whereIdentifiers: any = {}
	whereIsAdmin: any = {}
	whereOtpCode: any = {}
	constructor(userQueryDto: UserQueryDto = {}) {
		const { id, ids, email, status, signedInFrom, signedInTo, signedUpFrom, signedUpTo, identifiers, orders, emailUnique, isAdmin } = userQueryDto

		if (id)
			this.whereId = Prisma.validator<Prisma.UserWhereInput>()({
				id,
			})

		if (ids) {
			// id = asdf, 1,asdf
			const newIds = ids.split(',')
			this.whereIds = Prisma.validator<Prisma.UserWhereInput>()({
				id: {
					in: newIds,
				},
			})
		}
		if (status && (status == UserStatus.ACTIVATED || status == UserStatus.INACTIVATED || status == UserStatus.BANNED)) {
			this.whereStatus = Prisma.validator<Prisma.UserWhereInput>()({
				status,
			})
		}

		if (signedInFrom) {
			this.whereSignInFrom = Prisma.validator<Prisma.UserWhereInput>()({
				signedInAt: {
					gte: signedInFrom,
				},
			})
		}

		if (signedInTo) {
			this.whereSignInTo = Prisma.validator<Prisma.UserWhereInput>()({
				signedInAt: {
					lte: signedInTo,
				},
			})
		}

		if (signedUpFrom) {
			this.whereSignUpFrom = Prisma.validator<Prisma.UserWhereInput>()({
				signedUpAt: {
					gte: signedUpFrom,
				},
			})
		}

		if (signedUpTo) {
			this.whereSignUpTo = Prisma.validator<Prisma.UserWhereInput>()({
				signedUpAt: {
					lte: signedUpTo,
				},
			})
		}

		if (identifiers) {
			const identifierList = identifiers.indexOf(',') ? identifiers.split(',').map((el) => el.trim()) : identifiers
			this.whereIdentifiers = Prisma.validator<Prisma.UserWhereInput>()({
				identifier: {
					in: identifierList,
				},
			})
		}
		this.query = Prisma.validator<Prisma.UserWhereInput>()({
			AND: [
				this.whereId,
				this.whereIds,
				this.whereEmail,
				this.whereSignInFrom,
				this.whereSignInTo,
				this.whereSignUpFrom,
				this.whereSignUpTo,
				this.whereStatus,
				this.whereAddress,
				this.whereDefaultAddress,
				this.whereIdentifiers,
				this.whereIsAdmin,
			],
		})

		if (orders) {
			if (typeof orders === 'string') {
				const [key, value] = orders.split(' ')
				this.orders.push = { [decamelize(key)]: value }
			}

			if (Array.isArray(orders)) {
				orders.forEach((order) => {
					const [key, value] = order.split(' ')
					this.orders.push({ [decamelize(key)]: value })
				})
			}
		}
	}
}
