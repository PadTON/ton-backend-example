import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as moment from 'moment'
import * as TelegramBot from 'node-telegram-bot-api'

import { UserEntity } from 'src/users/entities'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'

@Injectable()
export class TelegramService implements OnModuleInit {
	private readonly logger = new Logger(TelegramService.name)
	private bot: TelegramBot
	private botUsername: string

	constructor(
		private readonly config: ConfigService,
		@Inject(USER_SERVICES)
		private readonly userService: IUserService,
	) {}

	onModuleInit() {
		const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')
		this.botUsername = this.config.get<string>('TELEGRAM_BOT_USERNAME')
		this.bot = new TelegramBot(token, { polling: true })
		this.initializeBot()
	}

	private initializeBot() {
		this.bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
			const chatId = msg.chat.id
			this.logger.log(`initializeBot ${msg.from.id}`)
			this.logger.log(`initializeBot ${match}`)
			const refData = match && match[1] ? match[1] : null
			const refId = refData ? refData.split('_')[1] : null
			const uniqueId = crypto.createHmac('sha256', 'WebAppData').update(String(msg.from.id)).digest('hex')
			console.log(`initializeBot ${refId}`)
			let user = await this.userService.findById(uniqueId)
			if (!user) {
				const newUser = new UserEntity({
					id: uniqueId,
					identifier: String(msg.from.id),
					verifiedAt: moment().toDate(),
					createdAt: moment().toDate(),
					updatedAt: moment().toDate(),
					signedUpAt: moment().toDate(),
					telegramId: String(msg.from.id),
					firstName: String(msg.from.first_name),
					lastName: msg.from.last_name ? String(msg.from.last_name) : '',
					telegramUsername: String(msg.from.username),
					languageCode: msg.from.language_code,
				})
				user = await this.userService.create(newUser)
			}
			if (refId) {
				// Save refId to user
			}
		})

		this.bot.on('polling_error', (error) => {
			console.error(error)
		})
	}

	private sendWelcomeMessage(chatId: number, refId: string) {
		const message = `
		Welcome! \n🌟 We're thrilled to have you join us on this epic adventure 🍀🚀`
		const appLink = this.generateAppLink()
		const options = {
			reply_markup: JSON.stringify({
				inline_keyboard: [[{ text: 'Play game', url: appLink, icon: '🎮' }]],
			}),
		}
		this.bot.sendMessage(chatId, message, options)
	}

	private generateAppLink(): string {
		return `https://t.me/${this.botUsername}/app`
	}

	private generateRefLink(refCode: string): string {
		// const refId = this.generateRefId(userId)
		return `https://t.me/${this.botUsername}?start=r_${refCode}`
	}

	private generateRefId(userId: number) {
		const uniqueId = crypto.createHmac('sha256', 'WebAppData').update(String(userId)).digest('hex').slice(0, 9)
		return uniqueId
	}

	async isUserSubscribed(userId, channelId) {
		try {
			const member = await this.bot.getChatMember(channelId, userId)
			return member && (member.status === 'member' || member.status === 'creator' || member.status === 'administrator')
		} catch (error) {
			console.log(error)
			return false
		}
	}
}
