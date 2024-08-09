import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { PageMetaDto, PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { UserQueryDto, WhereUser } from './dto/query-user.dto'
import { UserEntity } from './entities/user.entity'
import { IUserService } from './interfaces/user.service.interface'
import { IUserRepository, USER_REPOSITORY } from './interfaces/users.repositories.interface'
import moment from 'moment'

@Injectable()
export class UserService implements IUserService {
	private readonly logger = new Logger(UserService.name)

	constructor(@Inject(USER_REPOSITORY) private userRepository: IUserRepository, private configService: ConfigService) {}

	async findOne(userQueryDto: UserQueryDto): Promise<UserEntity> {
		const whereUser = new WhereUser(userQueryDto)
		const whereParams: Prisma.UserWhereInput = whereUser.query
		const users = await this.userRepository.findMany({ where: whereParams })

		if (!users.length) return undefined
		return users[0]
	}

	async create(user: UserEntity): Promise<UserEntity> {
		const userById = await this.userRepository.findById(user.id)
		if (userById) {
			return userById
		}

		const inputUser = {
			...user,
		}
		const createdUser = await this.userRepository.create(inputUser)
		createdUser.password = undefined
		return createdUser
	}

	async findAll(pageOptionsDto?: PageOptionsDto, userQueryDto?: UserQueryDto): Promise<PageDto<UserEntity>> {
		const { pageSize } = pageOptionsDto
		const skip = pageOptionsDto.skip

		const whereUser = new WhereUser(userQueryDto)

		const whereParams: Prisma.UserWhereInput = whereUser.query
		const order = whereUser.orders

		const totalRecord = await this.userRepository.count({ where: whereParams })

		const entities = await this.userRepository.findMany({
			skip,
			take: pageSize,
			order,
			where: whereParams,
		})

		const pageMetaDto = new PageMetaDto({ totalRecord, pageOptionsDto })

		return new PageDto(entities, pageMetaDto)
	}

	async findById(id: string): Promise<UserEntity> {
		const user = await this.userRepository.findById(id)
		if (user) return user
		return null
	}

	async findByWalletAddress(address: string): Promise<UserEntity> {
		const user = await this.userRepository.findByWalletAddress(address)
		if (user) return user
		return null
	}

	async update(id: string, body: UserEntity): Promise<UserEntity> {
		const updatedUser = await this.userRepository.update(id, body)
		if (updatedUser) return updatedUser
		throw new NotFoundException('User not found')
	}

	async delete(id: string): Promise<UserEntity> {
		return this.userRepository.delete(id)
	}

	async linkWalletAddress(userId: string, walletAddress: any): Promise<UserEntity> {
		const checkExistedWallet = await this.userRepository.findOne({ id: userId })
		if (checkExistedWallet && checkExistedWallet.walletAddress) {
			throw new ConflictException('User has been linked wallet')
		}
		return this.update(userId, { walletAddress })
	}
}
