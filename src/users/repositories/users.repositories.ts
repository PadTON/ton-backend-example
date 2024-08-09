import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from '../entities/user.entity'
import { IUserRepository } from '../interfaces/users.repositories.interface'
import * as moment from 'moment'
import { PrismaErrorCode } from '../constants'

@Injectable()
export class UserRepository implements IUserRepository {
	private readonly logger = new Logger(UserRepository.name)

	constructor(private readonly prisma: PrismaService) {}
	findByEmail(email: string): Promise<UserEntity> {
		throw new Error('Method not implemented.')
	}

	async findOne(query: any = {}): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({ where: query })
		return UserEntity.fromModel(user)
	}

	async notifyEvent(user: UserEntity, state: string): Promise<void> {}

	async create(data: UserEntity): Promise<UserEntity> {
		const dataModel = UserEntity.toModel(data)
		const user = await this.prisma.user.create({ data: dataModel })
		const userEntity = UserEntity.fromModel(user)
		return userEntity
	}

	async findMany(query: any = {}): Promise<UserEntity[]> {
		const { skip, take, where, order } = query
		const users = await this.prisma.user.findMany({
			where: where,
			skip,
			take,
			orderBy: order,
		})
		return users.map(UserEntity.fromModel)
	}

	async findById(id: string): Promise<UserEntity> {
		if (!id) return undefined

		const user = await this.prisma.user.findUnique({ where: { id } })
		if (!user) return undefined

		return UserEntity.fromModel(user)
	}

	async findByWalletAddress(address: string): Promise<UserEntity> {
		const user = await this.prisma.user.findFirst({ where: { walletAddress: address } })
		if (!user) return undefined

		return UserEntity.fromModel(user)
	}

	async delete(id: string): Promise<UserEntity> {
		if (!id) return undefined

		const user = await this.prisma.user.delete({ where: { id } })
		return UserEntity.fromModel(user)
	}

	async update(id: string, data: UserEntity): Promise<UserEntity> {
		// data.updatedAt = moment().unix()
		const dataModel = UserEntity.toModel(data)
		try {
			const user = await this.prisma.user.update({
				where: { id },
				data: dataModel,
			})

			return UserEntity.fromModel(user)
		} catch (err) {
			if (err.code === PrismaErrorCode.NOT_FOUND) {
				throw new NotFoundException('User not found')
			}
			throw err
		}
	}

	async count(params: any = {}): Promise<number> {
		return this.prisma.user.count(params)
	}
}
