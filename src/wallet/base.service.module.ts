import { Module } from '@nestjs/common'

import { RedisModule } from '@liaoliaots/nestjs-redis'
import { BullModule } from '@nestjs/bull'
import { ConfigModule } from '@nestjs/config'
import { RedisLockModule } from 'nestjs-simple-redis-lock'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersModule } from 'src/users/user.module'
import { UtilsService } from 'src/utils/utils.service'
import { ScanConfigRepository } from './repositories/scanconfig.repository'
import { TransactionRepository } from './repositories/transaction.repository'
import { WalletRepository } from './repositories/wallet.repository'
import { ScanService } from './services/scan.service'
import { TonService } from './services/ton.service'
import { TransactionService } from './services/transaction.service'
import { WalletService } from './services/wallet.service'
@Module({
	imports: [
		PrismaModule,
		ConfigModule,
		BullModule.registerQueue(),
		RedisModule.forRoot({
			config: {
				url: process.env.REDIS_URL,
			},
		}),
		RedisLockModule.register({}),
		UsersModule,
	],
	providers: [
		WalletService,
		WalletRepository,
		TransactionService,
		TransactionRepository,
		ScanService,
		ScanConfigRepository,
		PrismaService,
		UtilsService,
		TonService,
	],
	exports: [
		WalletService,
		WalletRepository,
		TransactionService,
		TransactionRepository,
		ScanService,
		ScanConfigRepository,
		PrismaService,
		UtilsService,
		RedisModule.forRoot({
			config: {
				url: process.env.REDIS_URL,
			},
		}),
		RedisLockModule.register({}),
	],
})
export class WalletServiceModule {}
