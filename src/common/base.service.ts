import { Injectable } from '@nestjs/common'
import { PageMetaDto, PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { BaseEntity } from './base.entity'
import { BaseRepository } from './base.repositories'
import { IBaseService } from './base.service.interface'
import { CreateData, UpdateData } from './base.repositories.interface'
@Injectable()
export abstract class BaseService<T extends BaseEntity, R extends BaseRepository<T>> implements IBaseService<T> {
	abstract getDefaultRepository(): R

	async findById(id: string): Promise<T> {
		return this.getDefaultRepository().findById(id)
	}

	async createMany(data: T[]): Promise<T[]> {
		return this.getDefaultRepository().getDelegate().createMany({ data })
	}

	async findAll(pageOptionsDto?: PageOptionsDto, queryDto?: any): Promise<PageDto<T>> {
		if (!pageOptionsDto) {
			pageOptionsDto = new PageOptionsDto()
		}
		if (!queryDto) {
			queryDto = {}
		}
		const { pageSize } = pageOptionsDto
		const skip = pageOptionsDto.skip
		queryDto.order = pageOptionsDto.order
		const whereQuery = this.buildWhereQuery(queryDto)

		const whereParams: any = whereQuery.query
		const order = whereQuery.orders
		const totalRecord = await this.getDefaultRepository().count({ where: whereParams })

		const entities = await this.getDefaultRepository().findMany({
			skip,
			take: pageSize,
			order,
			where: whereParams,
		})

		const pageMetaDto = new PageMetaDto({ totalRecord, pageOptionsDto })

		return new PageDto(entities, pageMetaDto)
	}

	abstract buildWhereQuery(queryDto: any): any

	buildOrders(queryDto: any): any {
		const orders: any[] = []
		if (queryDto.orders) {
			if (typeof queryDto.orders === 'string') {
				const [key, value] = queryDto.orders.split(' ')
				orders.push({ [key]: value })
			}

			if (Array.isArray(queryDto.orders)) {
				queryDto.orders.forEach((order) => {
					const [key, value] = order.split(' ')
					orders.push({ [key]: value })
				})
			}
		}

		if (queryDto.order) {
			const [key, value] = queryDto.order.split(' ')
			orders.push({ [key]: value })
		}
		return orders
	}

	async create(data: CreateData<T>): Promise<T> {
		return await this.getDefaultRepository().create(data)
	}

	async update(data: UpdateData<T>): Promise<T> {
		return await this.getDefaultRepository().update(data)
	}

	async findFirst(whereParams: any): Promise<T> {
		return await this.getDefaultRepository().findFirst(whereParams)
	}

	async findMany(whereParams: any): Promise<T[]> {
		return this.getDefaultRepository().findMany(whereParams)
	}
}
