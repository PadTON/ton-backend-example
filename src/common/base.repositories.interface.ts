import { BaseEntity } from './base.entity'

export type UpdateData<T extends BaseEntity> = Partial<Omit<T, 'id'> & Pick<T, 'id'>>

export type CreateData<T extends BaseEntity> = Omit<T, 'id'> & Partial<Pick<T, 'id'>>

export interface IBaseRepository<T extends BaseEntity> {
	count(params: any): Promise<number>
	findMany(query: any): Promise<T[]>
	create(data: CreateData<T>): Promise<T>
	findById(id: string): Promise<T>
	update(data: UpdateData<T>): Promise<T>
	getDelegate(): any
	findOne(query: any): Promise<T>
	findFirst(query: any): Promise<T>
}
