import { NestFactory } from '@nestjs/core'
import { randomUUID } from 'crypto'
import * as moment from 'moment'
import { AppModule } from '../app.module'
import { AuthService } from '../auth/auth.service'
import { AuthUserEntity } from '../auth/entities/user.entity'
import { AUTH_SERVICE } from '../auth/interfaces/auth.service.interface'
import { UserStatus } from '@prisma/client'
import { UserEntity } from 'src/users/entities'

enum NODE_ENV {
	DEVELOPMENT = 'development',
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule)
	const authService = await app.get<AuthService>(AUTH_SERVICE)
	const args = process.argv.slice(2)
	if (args.length < 2) {
		console.error('Usage: create-admin-user <email> <password>')
		process.exit(1)
	}
	const email = args[0]
	const password = args[1]
	let isAdmin = true
	if (args.length > 2) {
		const role = args[2]
		if (role === 'admin') {
			isAdmin = true
		} else if (role === 'user') {
			isAdmin = false
		} else {
			console.error('Invalid role. Valid roles are: admin, user')
			process.exit(1)
		}
	}
	const user: AuthUserEntity = {
		id: randomUUID(),
		identifier: email,
		password: password,
		createdAt: moment().toDate(),
	}
	if (isAdmin) {
		await authService.adminSignUp(user)
	} else {
		const registerUser = {
			...user,
			status: UserStatus.ACTIVATED,
		} as unknown as UserEntity
		await authService.userSignUp(registerUser)
	}
	process.exit(0)
}

bootstrap().catch(console.error)
