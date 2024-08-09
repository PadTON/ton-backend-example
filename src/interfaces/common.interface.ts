import { UserEntity } from 'src/users/entities'

export interface IBaseRepositoryService {
	create(data: object): Promise<any>

	findMany(query?: object, params?: any, skip?: number, take?: number): Promise<any>

	findById(id: string): Promise<any>

	update(id: string, data: object): Promise<any>

	findOne(query: any): Promise<any>
}

export interface BaseRequest extends Request {
	user?: UserEntity
}

export const BASE_REPOSITORY = 'BASE REPOSITORY'
