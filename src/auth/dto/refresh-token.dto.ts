import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
	@ApiProperty({
		description: 'The refresh token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
	})
	refreshToken: string
}
