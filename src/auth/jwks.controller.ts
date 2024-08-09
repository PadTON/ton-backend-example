import { Controller, Get, Inject } from '@nestjs/common'
import { JSON_WEB_TOKEN_SERVICE } from './interfaces'
import { JsonWebTokenService } from './jwt.service'

@Controller('jwks')
export class JsonWebKeyController {
	constructor(@Inject(JSON_WEB_TOKEN_SERVICE) private readonly jsonWebTokenService: JsonWebTokenService) {}

	@Get()
	getJsonWebKey() {
		return this.jsonWebTokenService.getKey()
	}
}
