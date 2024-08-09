import { Inject, UnauthorizedException } from '@nestjs/common'
import { UserEntity } from 'src/users/entities'
import { USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import { UserService } from 'src/users/user.service'
import { AuthUserEntity } from '../entities/user.entity'
import { IAuthRepository } from '../interfaces/auth.repository.interface'
import { AuthErrorMessage } from '../constants'
import * as bcrypt from 'bcrypt'

export default class AuthRepository implements IAuthRepository {
	constructor(
		@Inject(USER_SERVICES)
		private readonly userService: UserService,
	) {}

	async findUserById(id: string): Promise<AuthUserEntity> {
		const user = await this.userService.findById(id)
		if (!user) return null
		return AuthUserEntity.fromUserEntity(user)
	}

	async userCreateUser(userEntity: UserEntity): Promise<UserEntity> {
		const userCreated = await this.userService.create(userEntity)
		return userCreated
	}

	async adminCreateUser(user: AuthUserEntity): Promise<AuthUserEntity> {
		const userEntity = AuthUserEntity.toUserEntity(user)
		if (userEntity.password && userEntity.password.length > 0) {
			const hashedPassword = await bcrypt.hash(userEntity.password, 10)
			userEntity.password = hashedPassword
		}
		const userCreated = await this.userService.create(userEntity)
		return AuthUserEntity.fromUserEntity(userCreated)
	}

	async adminSignIn(identifier: string, password: string): Promise<AuthUserEntity> {
		const user = await this.userService.findOne({
			email: identifier,
		})
		const compareResult = await bcrypt.compare(password, user.password)
		if (!compareResult) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		const authUser = AuthUserEntity.fromUserEntity(user)
		authUser.password = undefined
		return authUser
	}
}
