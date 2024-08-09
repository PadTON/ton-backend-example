import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { AllExceptionsFilter } from './all-exceptions'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { urlencoded, json } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

enum NODE_ENV {
	DEVELOPMENT = 'development',
}

;(BigInt.prototype as any).toJSON = function () {
	return this.toString()
}

async function bootstrap() {
	const port = process.env.PORT || 3000
	const app = await NestFactory.create(AppModule, { bufferLogs: true })
	const configService = app.get(ConfigService)
	const nodeEnv = configService.get('NODE_ENV')

	const globalInterceptors = [new TransformInterceptor()]
	app.use(json({ limit: '50mb' }))
	app.use(urlencoded({ extended: true, limit: '50mb' }))
	app.useGlobalInterceptors(...globalInterceptors)
	app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)))
	app.useGlobalPipes(new ValidationPipe({ transform: true, enableDebugMessages: true }))
	app.enableCors()

	const config = new DocumentBuilder()
		.setTitle('Platform API')
		.setDescription('The Platform API description')
		.setVersion('1')
		.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
		.build()
	const document = SwaggerModule.createDocument(app, config)

	if (nodeEnv === NODE_ENV.DEVELOPMENT) SwaggerModule.setup('swagger', app, document)
	await app.listen(port)
}
bootstrap()
