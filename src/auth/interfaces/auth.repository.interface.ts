import { UserEntity } from 'src/users/entities'
import { AuthUserEntity } from '../entities/user.entity'

export interface IAuthRepository {
	userCreateUser(userEntity: UserEntity): Promise<UserEntity>

	adminCreateUser(user: AuthUserEntity): Promise<AuthUserEntity>

	findUserById(id: string): Promise<AuthUserEntity>

	adminSignIn(identifier: string, password: string): Promise<AuthUserEntity>
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY'
