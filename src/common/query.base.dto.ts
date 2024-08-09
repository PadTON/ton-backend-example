import { IsArray, IsOptional, IsString } from 'class-validator'

export class QueryBaseDto {
	@IsOptional()
	@IsString()
	order?: string

	@IsOptional()
	@IsArray()
	orders?: string[]
}
