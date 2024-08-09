import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { AuthService } from '../auth/auth.service'
import { AUTH_SERVICE } from '../auth/interfaces/auth.service.interface'
import { UserEntity } from 'src/users/entities'

enum NODE_ENV {
	DEVELOPMENT = 'development',
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule)
	const authService = await app.get<AuthService>(AUTH_SERVICE)
	const args = process.argv.slice(2)
	if (args.length < 1) {
		console.error('Usage: generate-user-token <uuid>')
		process.exit(1)
	}
	const userId = args[0]
	const user = await authService.generateJWTToken({ id: userId } as UserEntity)
	console.log(user)
	process.exit(0)
}

bootstrap().catch(console.error)
