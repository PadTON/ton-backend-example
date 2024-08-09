import { Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

function isEmptyObject(object: object) {
	return Object.keys(object).length === 0
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: any, host: ArgumentsHost) {
		if (isEmptyObject(exception)) {
			this.logger.error(exception.message)
		} else {
			this.logger.error(exception)
		}

		let message = exception.message ? exception.message : HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR]
		const { httpAdapter } = this.httpAdapterHost
		const ctx = host.switchToHttp()
		const isHttpException = exception instanceof HttpException

		const httpStatus = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

		if (isHttpException) {
			const responseEx: any = exception.getResponse().valueOf()
			message = responseEx.message
			if (responseEx.message instanceof Array) message = responseEx.message[0]
		}

		const response = {
			status: false,
			message: message,
			data: null,
		}
		httpAdapter.reply(ctx.getResponse(), response, httpStatus)
	}
}
