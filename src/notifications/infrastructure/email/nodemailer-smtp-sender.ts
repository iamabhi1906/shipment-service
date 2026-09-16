import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";
import type {
	EmailSender,
	SendEmailOptions,
	SendEmailResult,
} from "../../domain/notification/interface/email-sender.interface.js";

@Injectable()
export class NodemailerSmtpSender implements EmailSender, OnModuleInit {
	private readonly logger = new Logger(NodemailerSmtpSender.name);

	private transporter!: Transporter;

	constructor(private readonly configService: ConfigService) {}

	onModuleInit(): void {
		const host = this.configService.get<string>("SMTP_HOST", "localhost");
		const port = Number(this.configService.get<string>("SMTP_PORT", "587"));
		const secure = this.configService.get<string>("SMTP_SECURE", "false").toLowerCase() === "true";
		const user = this.configService.get<string>("SMTP_USER");
		const pass = this.configService.get<string>("SMTP_PASS");
		this.transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			...(user && pass ? { auth: { user, pass } } : {}),
		});
		this.logger.log(`SMTP configured: ${host}:${port} (TLS: ${secure})`);
	}

	async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
		try {
			const info = await this.transporter.sendMail({
				from: options.from ?? this.configService.get<string>("SMTP_FROM"),
				to: options.to,
				subject: options.subject,
				text: options.text,
				html: options.html,
			});

			return {
				success: true,
				messageId: info.messageId,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown SMTP error";

			this.logger.error(`Failed to send email to ${options.to}: ${message}`);

			return {
				success: false,
				error: message,
			};
		}
	}
}
