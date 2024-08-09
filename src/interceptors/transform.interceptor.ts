import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SUCCESSFULLY } from './constants'

export interface Response<T> {
	status: boolean
	message: string
	data: T
	totalPage?: number
	totalRecord?: number
	total?: number
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		const [req] = context.getArgs()
		const { query, body } = req

		//Normalize string query and body
		for (const field in query) {
			if (typeof query[field] === 'string') {
				query[field] = query[field].normalize()
			}
		}
		for (const field in body) {
			if (typeof body[field] === 'string') {
				body[field] = body[field].normalize()
			}
		}
		const originalUrl = String(req.originalUrl)
		if (originalUrl === '/jwks' || originalUrl.startsWith('/.well-known') || originalUrl.startsWith('/admin/campaign-report'))
			return next.handle()

		return next.handle().pipe(
			map((data) => ({
				status: true,
				message: SUCCESSFULLY,
				data: data && data.data ? data.data : data,
				meta: data && data.meta ? data.meta : undefined,
			})),
		)
	}
}
