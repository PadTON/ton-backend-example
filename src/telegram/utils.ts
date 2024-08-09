import fetch from 'node-fetch'

export class TelegramUtils {
	private readonly botToken: string

	constructor(botToken: string) {
		this.botToken = botToken
	}
	async checkUserSubscribe(userId, chatId) {
		const url = `https://api.telegram.org/bot${this.botToken}/getChatMember?user_id=${userId}&chat_id=${chatId}`
		console.log(url)
		const response = await fetch(url)
		const data = await response.json()
		console.log(data)
		return data.ok
	}
}
