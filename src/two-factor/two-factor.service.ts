import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IUserRepository, USER_REPOSITORY } from 'src/users/interfaces/users.repositories.interface'
import { ITwoFactorAuthService } from './interfaces/two-factor.service.interface'

@Injectable()
export class TwoFactorAuthService implements ITwoFactorAuthService {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository, private readonly configService: ConfigService) {}
}
