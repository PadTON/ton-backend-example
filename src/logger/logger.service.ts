import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common'

export interface ILogger {
	info(message: any): void

	error(message: any): void

	warn(message: any): void

	debug(message: any): void
}
@Injectable()
export class LoggerService extends ConsoleLogger implements ILogger {
	info(message: any): void {
		console.log(JSON.stringify(message))
	}

	error(message: any): void {
		console.error(JSON.stringify(message))
	}

	warn(message: any): void {
		console.warn(JSON.stringify(message))
	}

	debug(message: any): void {
		console.debug(JSON.stringify(message))
	}

	protected formatPid(pid: number) {
		return `${pid}`
	}

	protected colorize(message: string, logLevel: LogLevel) {
		return message
	}

	protected formatMessage(
		logLevel: LogLevel,
		message: unknown,
		pidMessage: string,
		formattedLogLevel: string,
		contextMessage: string,
		timestampDiff: string,
	): string {
		return `${JSON.stringify({
			pidMessage,
			timestamp: this.getTimestamp(),
			logLevel,
			contextMessage,
			message,
			timestampDiff,
		})}\n`
	}
}
