import { IBaseRepositoryService } from 'src/interfaces/common.interface'
import { UserEntity } from '../entities/user.entity'

export interface IUserRepository extends IBaseRepositoryService {
	findByEmail(email: string): Promise<UserEntity | undefined>
	count(whereParams: any): Promise<number>
	delete(id: string): Promise<UserEntity>
	notifyEvent(user: UserEntity, state: string): Promise<void>
	findByWalletAddress(address: string): Promise<UserEntity | undefined>
}

export const USER_REPOSITORY = 'USER REPOSITORY'
