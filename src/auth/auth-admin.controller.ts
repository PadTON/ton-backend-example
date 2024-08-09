import { Body, Controller, Inject, Logger, Post, Req } from '@nestjs/common'
import { AdminSignInDto } from './dto/admin-sign-in.dto'
import { AUTH_SERVICE, IAuthService } from './interfaces/auth.service.interface'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { BaseRequest } from 'src/interfaces/common.interface'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'

@Controller('admin/auth')
export class AdminAuthController {
	private readonly logger = new Logger(AdminAuthController.name)

	constructor(
		@Inject(AUTH_SERVICE) private readonly authService: IAuthService,
		@Inject(USER_SERVICES)
		private readonly userService: IUserService,
	) {}

	@Post('login')
	async signIn(@Req() req: BaseRequest, @Body() adminSignIn: AdminSignInDto) {
		const { identifier, password } = adminSignIn
		const user = await this.authService.adminSignIn(identifier.trim().toLowerCase(), password)
		this.logger.log({
			message: `User ${user.id} login successfully`,
			identifier,
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

	@Post('refresh-token')
	async refreshToken(@Req() req: BaseRequest, @Body() refreshTokenDto: RefreshTokenDto) {
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
}
