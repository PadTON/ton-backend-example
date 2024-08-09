export interface JwtKey {
	keys: object[]
}
export interface IJsonWebTokenService {
	generateKey(): void

	getKey(): Promise<JwtKey>

	sign(payload: object): Promise<string>

	decode(token: string): Promise<any>
}

export const JSON_WEB_TOKEN_SERVICE = 'JSON WEB TOKEN SERVICE'


