import { Module } from '@nestjs/common'

import { WalletController } from './controller/wallet.controller'
import { ConfigurableModuleClass } from './config'
import { WalletServiceModule } from './base.service.module'
@Module({
	imports: [WalletServiceModule],
	controllers: [WalletController],
})
export class WalletModule extends ConfigurableModuleClass {}
