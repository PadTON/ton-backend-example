import { Module } from '@nestjs/common'

import { ConfigurableModuleClass } from './config'
import { WalletServiceModule } from './base.service.module'
@Module({
	imports: [WalletServiceModule],
	controllers: [],
})
export class WalletEventModule extends ConfigurableModuleClass {}
