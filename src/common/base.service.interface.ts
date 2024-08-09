import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { BaseEntity } from './base.entity'
import { UpdateData } from './base.repositories.interface'

export interface IBaseService<T extends BaseEntity> {
	create(data: T): Promise<T>
	findById(id: string): Promise<T>
	findAll(pageOptionsDto?: PageOptionsDto, queryDto?: any): Promise<PageDto<T>>
	update(data: UpdateData<T>): Promise<T>
}
