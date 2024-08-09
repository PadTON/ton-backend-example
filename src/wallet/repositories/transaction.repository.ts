import { BaseRepository } from 'src/common/base.repositories'
import { Transaction } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TransactionRepository extends BaseRepository<Transaction> {
	constructor(private readonly prisma: PrismaService) {
		super()
	}

	getPrisma() {
		return this.prisma
	}

	getDelegate() {
		return this.prisma.transaction
	}
}
