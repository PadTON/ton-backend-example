enum AuthErrorMessage {
	UNAUTHORIZED = 'Unauthorized',
	TFA_CODE_REQUIRED = 'Verification Code is required. Please input this field',
	INVALID_TWO_FACTOR = 'Verification Code is invalid',
	INVALID_EMAIL = 'Email is invalid',
	PERMISSION_DENIED = 'Permission denied',
	CURRENT_PASSWORD_NOT_CORRECT = 'Current password not correct',
	INVALID_CAPTCHA = 'Invalid captcha',
	INVALID_EMAIL_OR_PASSWORD = 'Email or password is invalid',
}

enum ResetPasswordErrorMessage {
	HAS_BEEN_RESET_PASSWORD = 'Password has been reset',
	EXPIRED_LINK = 'Session has expired',
	USER_NOT_FOUND = 'User not found',
}

enum EmailVerificationErrorMessage {
	EMAIL_EXISTS = 'This email has existed. Please try again',
	EMAIL_HAS_BEEN_SENT = 'An email is sent. Please check to get the verification code',
	INVALID_CODE = 'Your verification code is invalid',
	HAS_BEEN_REGISTERED_EMAIL = 'User has been registered email',
}
export { AuthErrorMessage, ResetPasswordErrorMessage, EmailVerificationErrorMessage }
