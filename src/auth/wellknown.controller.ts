import { Controller, Get, Inject, Logger } from '@nestjs/common'
import { JSON_WEB_TOKEN_SERVICE } from './interfaces'
import { JsonWebTokenService } from './jwt.service'
import { ConfigService } from '@nestjs/config'

@Controller('.well-known')
export class WellKnownController {
	private readonly logger = new Logger(WellKnownController.name)
	private readonly webCredentialAppId: string
	constructor(
		@Inject(JSON_WEB_TOKEN_SERVICE) private readonly jsonWebTokenService: JsonWebTokenService,
		private readonly configService: ConfigService,
	) {
		this.webCredentialAppId = this.configService.get<string>('WEB_CREDENTIAL_APP_ID')
	}
}
