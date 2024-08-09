import { Inject, Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { JSON_WEB_TOKEN_SERVICE } from 'src/auth/interfaces'
import { JsonWebTokenService } from 'src/auth/jwt.service'

@Injectable()
export class VerifiedUser implements NestMiddleware {
	private readonly logger = new Logger(VerifiedUser.name)
	constructor(
		@Inject(JSON_WEB_TOKEN_SERVICE)
		private readonly jsonWebTokenService: JsonWebTokenService,
	) {}
	async use(request: any, res: any, next: (error?: any) => void) {
		const headersAuth = request.headers.authorization
		const token = headersAuth && headersAuth.split(' ')[0] === 'Bearer' ? headersAuth.split(' ')[1] : undefined
		if (token) {
			try {
				const decode = await this.jsonWebTokenService.decode(token)
				request.user = {}
				request.user.id = decode.uid
				request.user.telegramId = decode.telegramId
				request.user.role = decode.role
				request.user.isAdmin = decode.isAdmin
				this.logger.log({
					message: `User ${decode.uid} access successfully`,
					identifier: decode.uid,
					isAdmin: decode.isAdmin,
					role: decode.role,
					url: request.url,
					method: request.method,
					headers: {
						'x-forwarded-for': request.headers['x-forwarded-for'],
						'x-real-ip': request.headers['x-real-ip'],
						'user-agent': request.headers['user-agent'],
						'cf-connecting-ip': request.headers['cf-connecting-ip'],
						'cf-ipcountry': request.headers['cf-ipcountry'],
						'sec-ch-ua': request.headers['sec-ch-ua'],
						'sec-ch-ua-mobile': request.headers['sec-ch-ua-mobile'],
						'sec-ch-ua-platform': request.headers['sec-ch-ua-platform'],
						'cf-ray': request.headers['cf-ray'],
					},
				})
			} catch (err) {
				throw new UnauthorizedException()
			}
		} else {
			throw new UnauthorizedException()
		}
		next()
	}
}

@Injectable()
export class VerifiedAdminUser implements NestMiddleware {
	private readonly logger = new Logger(VerifiedAdminUser.name)
	constructor(
		@Inject(JSON_WEB_TOKEN_SERVICE)
		private readonly jsonWebTokenService: JsonWebTokenService,
	) {}
	async use(request: any, res: any, next: (error?: any) => void) {
		const headersAuth = request.headers.authorization
		const token = headersAuth && headersAuth.split(' ')[0] === 'Bearer' ? headersAuth.split(' ')[1] : undefined
		if (token) {
			try {
				const decode = await this.jsonWebTokenService.decode(token)

				if (!decode.isAdmin) {
					throw new UnauthorizedException()
				}
				request.user = {}
				request.user.id = decode.uid
				request.user.role = decode.role
				request.user.isAdmin = decode.isAdmin
				this.logger.log({
					message: `User ${decode.uid} access successfully`,
					identifier: decode.uid,
					isAdmin: decode.isAdmin,
					role: decode.role,
					url: request.url,
					method: request.method,
					headers: {
						'x-forwarded-for': request.headers['x-forwarded-for'],
						'x-real-ip': request.headers['x-real-ip'],
						'user-agent': request.headers['user-agent'],
						'cf-connecting-ip': request.headers['cf-connecting-ip'],
						'cf-ipcountry': request.headers['cf-ipcountry'],
						'sec-ch-ua': request.headers['sec-ch-ua'],
						'sec-ch-ua-mobile': request.headers['sec-ch-ua-mobile'],
						'sec-ch-ua-platform': request.headers['sec-ch-ua-platform'],
						'cf-ray': request.headers['cf-ray'],
					},
				})
			} catch (err) {
				throw new UnauthorizedException()
			}
		} else {
			throw new UnauthorizedException()
		}
		next()
	}
}
