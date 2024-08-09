import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export enum Order {
	ASC = 'asc',
	DESC = 'desc',
}

export class PageOptionsDto {
	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	readonly order?: string

	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	readonly page?: number = 1

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 50,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	readonly pageSize?: number = 10

	get skip(): number {
		return (this.page - 1) * this.pageSize
	}
}

export interface PageMetaDtoParameters {
	pageOptionsDto: PageOptionsDto
	totalRecord: number
}

export class PageMetaDto {
	@ApiProperty()
	readonly page: number

	@ApiProperty()
	readonly pageSize: number

	@ApiProperty()
	readonly totalRecord: number

	@ApiProperty()
	readonly totalPage: number

	constructor({ pageOptionsDto, totalRecord }: PageMetaDtoParameters) {
		this.page = pageOptionsDto.page
		this.pageSize = pageOptionsDto.pageSize
		this.totalRecord = totalRecord
		this.totalPage = Math.ceil(this.totalRecord / this.pageSize)
	}
}
