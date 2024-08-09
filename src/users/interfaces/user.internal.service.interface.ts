import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { UserQueryDto } from '../dto/query-user.dto'
import { UserEntity } from '../entities/user.entity'

export interface IUserInternalService {
	findOne(userQueryDto: UserQueryDto): Promise<UserEntity>
}

export const USER_INTERNAL_SERVICES = 'USER INTERNAL SERVICES'
