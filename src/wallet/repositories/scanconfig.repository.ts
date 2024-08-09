import { BaseRepository } from 'src/common/base.repositories'
import { TonScanConfig } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ScanConfigRepository extends BaseRepository<TonScanConfig> {
	constructor(private readonly prisma: PrismaService) {
		super()
	}

	getPrisma() {
		return this.prisma
	}

	getDelegate() {
		return this.prisma.tonScanConfig
	}
}
