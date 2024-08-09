import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './role.decorator'
import { UserRole } from 'src/users/entities'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
		if (!requiredRoles) {
			return true
		}
		const { user } = context.switchToHttp().getRequest()
		if (!user) {
			return false
		}
		if (user.role?.includes(UserRole.ADMIN)) return true 
		return requiredRoles.some((role) => user.role?.includes(role))
	}
}
