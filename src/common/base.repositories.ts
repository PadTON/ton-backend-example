import { Injectable } from '@nestjs/common'
import { BaseEntity } from './base.entity'
import { CreateData, IBaseRepository, UpdateData } from './base.repositories.interface'

@Injectable()
export abstract class BaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
	abstract getDelegate(): any

	async update(data: UpdateData<T>): Promise<T> {
		const model = await this.getDelegate().update({
			where: {
				id: data.id,
			},
			data: data,
		})
		return model
	}

	async findMany(query: any): Promise<T[]> {
		const { skip, take, where, order } = query
		const models = await this.getDelegate().findMany({
			where: where,
			skip,
			take,
			orderBy: order,
		})
		return models
	}

	async findById(id: string): Promise<T> {
		return await this.getDelegate().findFirst({ where: { id } })
	}

	async create(data: CreateData<T>): Promise<T> {
		return await this.getDelegate().create({ data: data })
	}

	async count(params: any = {}): Promise<number> {
		return this.getDelegate().count(params)
	}

	async findOne(query: any): Promise<T> {
		const model = await this.getDelegate().findFirst({
			where: query,
		})
		return model
	}

	async findFirst(query: any): Promise<T> {
		const model = await this.getDelegate().findFirst({
			where: query,
		})
		return model
	}
}
