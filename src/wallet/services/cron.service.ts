import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ScanService } from './scan.service'

@Injectable()
export class CronService {
	private readonly logger = new Logger(CronService.name)
	private isRunningTonScan = false

	constructor(private readonly scanService: ScanService) {}

	@Cron('*/20 * * * * *')
	async runDepositTonScan() {
		this.logger.debug('Running Deposit Ton Scan')
		await this.scanService.scanDepositUSDTEvents()
	}

	@Cron('*/20 * * * * *')
	async runWithdrawTonScan() {
		this.logger.debug('Running Withdraw Ton Scan')
		await this.scanService.processWithdrawTransaction()
	}

	@Cron('*/20 * * * * *')
	async runVerifyWithdrawTonScan() {
		this.logger.debug('Running Verify Withdraw Ton Scan')
		await this.scanService.verifyWithdrawTransaction()
	}
}
