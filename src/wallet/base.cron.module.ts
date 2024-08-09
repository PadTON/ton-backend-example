import { Module } from '@nestjs/common'

import { ConfigurableModuleClass } from './config'
import { WalletServiceModule } from './base.service.module'
import { CronService } from './services/cron.service'
@Module({
	imports: [WalletServiceModule],
	providers: [CronService],
})
export class WalletCronModule extends ConfigurableModuleClass {}
