import { Body, Controller, Inject, Post, Req, Logger, CACHE_MANAGER } from '@nestjs/common'
import { BaseRequest } from 'src/interfaces/common.interface'
import { ITwoFactorAuthService, TWO_FACTOR_AUTH } from 'src/two-factor/interfaces/two-factor.service.interface'
import { AUTH_SERVICE, IAuthService } from './interfaces/auth.service.interface'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import { AuthUserEntity } from './entities'
import { UtilsService } from 'src/utils/utils.service'
import { ConfigService } from '@nestjs/config'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RedisLockService } from 'nestjs-simple-redis-lock'
import { Cache } from 'cache-manager'
import { ApiTags } from '@nestjs/swagger'
import { LoginMiniAppDto } from './dto/login-miniapp-dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	private logger = new Logger(AuthController.name)
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,

		@Inject(TWO_FACTOR_AUTH)
		private readonly twoFactorAuthService: ITwoFactorAuthService,

		@Inject(USER_SERVICES)
		private readonly userService: IUserService,

		private readonly utilsService: UtilsService,
		private configService: ConfigService,
		protected readonly lockService: RedisLockService,
		@Inject(CACHE_MANAGER) private readonly cacheService: Cache,
	) {}

	@Post('refresh-token')
	async refreshToken(@Req() req: BaseRequest, @Body() refreshTokenDto: RefreshTokenDto): Promise<AuthUserEntity> {
		const user = await this.authService.refreshToken(refreshTokenDto.refreshToken)
		this.logger.log({
			message: `User ${user.id} refresh token successfully`,
			identifier: user.identifier,
			isAdmin: user.isAdmin,
			role: user.role,
			headers: {
				'x-forwarded-for': req.headers['x-forwarded-for'],
				'x-real-ip': req.headers['x-real-ip'],
				'user-agent': req.headers['user-agent'],
				'cf-connecting-ip': req.headers['cf-connecting-ip'],
				'cf-ipcountry': req.headers['cf-ipcountry'],
				'sec-ch-ua': req.headers['sec-ch-ua'],
				'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'],
				'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
				'cf-ray': req.headers['cf-ray'],
			},
		})
		return user
	}

	@Post('login')
	async signIn(@Req() req: BaseRequest, @Body() body: LoginMiniAppDto) {
		const { data } = body
		const user = await this.authService.signInMiniApp(data)
		this.logger.log({
			message: `User ${user.identifier} login successfully`,
			headers: {
				'x-forwarded-for': req.headers['x-forwarded-for'],
				'x-real-ip': req.headers['x-real-ip'],
				'user-agent': req.headers['user-agent'],
				'cf-connecting-ip': req.headers['cf-connecting-ip'],
				'cf-ipcountry': req.headers['cf-ipcountry'],
				'sec-ch-ua': req.headers['sec-ch-ua'],
				'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'],
			},
		})
		return user
	}
}
