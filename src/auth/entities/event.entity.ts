export interface ResetPasswordEvent {
	token: string
	email: string
	nickName: string
}
export const ResetPasswordEventName = 'auth.resetPassword'

export interface ConfirmUserEvent {
	nickName: string
	code: string
}
export const ConfirmUserEventName = 'auth.confirmUser'

export interface ConfirmUserSuccessfullyEvent {
	nickName: string
	email: string
}
export const ConfirmUserSuccessfullyEventName = 'auth.confirmUserSuccessfully'

export interface IResetPasswordSuccessfullyEvent {
	nickName: string
	email: string
}
export const ResetPasswordSuccessfullyName = 'auth.resetPasswordSuccessFull'
