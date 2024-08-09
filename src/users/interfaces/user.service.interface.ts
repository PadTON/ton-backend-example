import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { UserQueryDto } from '../dto/query-user.dto'
import { UserEntity } from '../entities/user.entity'
export interface IUserService {
	create(user: UserEntity): Promise<UserEntity>

	findAll(pageOptionsDto?: PageOptionsDto, userQueryDto?: UserQueryDto): Promise<PageDto<UserEntity>>

	delete(id: string): Promise<UserEntity>

	findById(id: string): Promise<UserEntity>

	findOne(userQueryDto: UserQueryDto): Promise<UserEntity>

	update(id: string, body: UserEntity): Promise<UserEntity>

	findByWalletAddress(address: string): Promise<UserEntity>

	linkWalletAddress(userId: string, walletAddress: string): Promise<UserEntity>
}

export const USER_SERVICES = 'USER SERVICES'
