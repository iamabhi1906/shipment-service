export const EMAIL_SENDER_TOKEN = Symbol("EMAIL_SENDER_TOKEN");

export interface SendEmailOptions {
	to: string;
	subject: string;
	text?: string;
	html?: string;
	from?: string;
}

export interface SendEmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

export interface EmailSender {
	sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
