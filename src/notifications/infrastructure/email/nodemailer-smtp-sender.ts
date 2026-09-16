import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";
import type {
	EmailSender,
	SendEmailOptions,
	SendEmailResult,
} from "../../domain/notification/ports/email-sender.interface.js";

@Injectable()
export class NodemailerSmtpSender implements EmailSender, OnModuleInit {
	private readonly logger = new Logger(NodemailerSmtpSender.name);
	private transporter: Transporter | null = null;
	private defaultFrom: string;

	constructor(private readonly configService: ConfigService) {
		this.defaultFrom = this.configService.get<string>("SMTP_FROM")!;
	}

	async onModuleInit(): Promise<void> {
		await this.initTransporter();
	}

	private async initTransporter(): Promise<void> {
		try {
			this.transporter = nodemailer.createTransport({
				host: this.configService.get<string>("SMTP_HOST"),
				port: Number(this.configService.get<number>("SMTP_PORT") || 587),
				auth: {
					user: this.configService.get<string>("SMTP_USER"),
					pass: this.configService.get<string>("SMTP_PASS"),
				},
			});
			this.logger.log(`SMTP transporter initialized. Host: ${this.configService.get<string>("SMTP_HOST")}`);
		} catch (err) {
			this.logger.error("Failed to create SMTP transporter", err);
			this.transporter = nodemailer.createTransport({
				jsonTransport: true,
			});
		}
	}

	async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
		if (!this.transporter) await this.initTransporter();
		try {
			const info = await this.transporter!.sendMail({
				from: options.from || this.defaultFrom,
				to: options.to,
				subject: options.subject,
				text: options.text,
				html: options.html,
			});

			this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
			return {
				success: true,
				messageId: info.messageId,
			};
		} catch (error: any) {
			this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error.stack);
			return {
				success: false,
				error: error.message || "Unknown SMTP error",
			};
		}
	}
}
