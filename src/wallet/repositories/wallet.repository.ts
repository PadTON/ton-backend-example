import { BaseRepository } from 'src/common/base.repositories'
import { Wallet } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class WalletRepository extends BaseRepository<Wallet> {
	constructor(private readonly prisma: PrismaService) {
		super()
	}

	getPrisma() {
		return this.prisma
	}

	getDelegate() {
		return this.prisma.wallet
	}
}
