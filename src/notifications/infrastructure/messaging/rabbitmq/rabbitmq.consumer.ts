import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import type { Channel, ConsumeMessage, Options } from "amqplib";
import { RabbitMQConnection } from "../../../../common/rabbitmq/index.js";
import { NodemailerSmtpSender } from "../../email/nodemailer-smtp-sender.js";
import { NotificationMessage } from "./rabbitmq-message.types.js";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
	private readonly logger = new Logger(RabbitMQConsumer.name);
	private activeChannel: Channel | null = null;

	constructor(
		private readonly rabbitmqConnection: RabbitMQConnection,
		private readonly configService: ConfigService,
		private readonly smtpSender: NodemailerSmtpSender,
	) {}

	async onModuleInit(): Promise<void> {
		await this.startConsumer();
		setInterval(() => void this.startConsumer(), 2000).unref();
	}

	private async startConsumer(): Promise<void> {
		const channel = this.rabbitmqConnection.getChannel();
		if (!channel) {
			return;
		}
		if (this.activeChannel === channel) {
			return;
		}

		try {
			await this.setupQueueAndConsume(channel);
			this.activeChannel = channel;
		} catch (error: any) {
			this.logger.error(`Error configuring RabbitMQ consumer: ${error.message}`, error.stack);
		}
	}

	private async setupQueueAndConsume(channel: Channel): Promise<void> {
		const exchangeName = this.rabbitmqConnection.exchangeName;
		const queueName = this.configService.get<string>("RABBITMQ_NOTIFICATION_QUEUE", "notification_queue");
		const retryQueueName = this.configService.get<string>("RABBITMQ_NOTIFICATION_RETRY_QUEUE", `${queueName}.retry`);
		const deadLetterQueueName = this.configService.get<string>("RABBITMQ_NOTIFICATION_DLQ", `${queueName}.dlq`);
		const retryDelayMs = Number(this.configService.get<string>("RABBITMQ_NOTIFICATION_RETRY_DELAY_MS", "5000"));

		await channel.assertExchange(exchangeName, "topic", {
			durable: true,
		});

		await channel.assertQueue(queueName, {
			durable: true,
		});
		await channel.assertQueue(retryQueueName, {
			durable: true,
			arguments: {
				"x-message-ttl": retryDelayMs,
				"x-dead-letter-exchange": "",
				"x-dead-letter-routing-key": queueName,
			},
		});
		await channel.assertQueue(deadLetterQueueName, { durable: true });

		const bindings = ["shipment.#"];

		for (const routingKey of bindings) {
			await channel.bindQueue(queueName, exchangeName, routingKey);
			this.logger.log(`Bound queue '${queueName}' to topic exchange '${exchangeName}' with key '${routingKey}'`);
		}

		channel.prefetch(1);

		await channel.consume(
			queueName,
			async (msg: ConsumeMessage | null) => {
				if (!msg) {
					return;
				}

				await this.handleMessage(channel, msg, retryQueueName, deadLetterQueueName);
			},
			{
				noAck: false,
			},
		);

		this.logger.log(`RabbitMQ Consumer active on topic exchange '${exchangeName}' and queue '${queueName}'`);
	}

	private async handleMessage(
		channel: Channel,
		msg: ConsumeMessage,
		retryQueueName: string,
		deadLetterQueueName: string,
	): Promise<void> {
		const messageId = msg.properties.messageId || randomUUID();
		let payload: NotificationMessage;

		try {
			payload = JSON.parse(msg.content.toString()) as NotificationMessage;
		} catch {
			this.moveToDeadLetter(channel, msg, deadLetterQueueName, "Invalid JSON");
			return;
		}

		try {
			const result = await this.smtpSender.sendEmail({
				to: "test@gmail.com",
				subject: payload.subject ?? "Notification",
				html: payload.html ?? payload.body,
				text: payload.text ?? payload.body,
			});

			if (!result.success) {
				throw new Error(result.error ?? "SMTP delivery failed");
			}

			channel.ack(msg);
			this.logger.log(`Notification ${messageId} delivered(SMTP id: ${result.messageId})`);
		} catch (error) {
			const retryCount = Number(msg.properties.headers?.["x-retry-count"] ?? 0);
			const maxRetries = Number(this.configService.get<string>("RABBITMQ_NOTIFICATION_MAX_RETRIES", "3"));
			const reason = error instanceof Error ? error.message : "Unknown SMTP error";

			if (retryCount >= maxRetries) {
				this.moveToDeadLetter(channel, msg, deadLetterQueueName, reason);
				return;
			}

			channel.sendToQueue(
				retryQueueName,
				msg.content,
				this.messageOptions(msg, messageId, {
					"x-retry-count": retryCount + 1,
					"x-last-error": reason,
				}),
			);
			channel.ack(msg);
			this.logger.warn(`Notification ${messageId} failed; queued retry ${retryCount + 1}/${maxRetries}: ${reason}`);
		}
	}

	private moveToDeadLetter(channel: Channel, msg: ConsumeMessage, deadLetterQueueName: string, reason: string): void {
		const messageId = msg.properties.messageId || randomUUID();
		channel.sendToQueue(
			deadLetterQueueName,
			msg.content,
			this.messageOptions(msg, messageId, { "x-failure-reason": reason }),
		);
		channel.ack(msg);
		this.logger.error(`Notification ${messageId} moved to DLQ: ${reason}`);
	}

	private messageOptions(
		msg: ConsumeMessage,
		messageId: string,
		headers: Record<string, string | number>,
	): Options.Publish {
		return {
			persistent: true,
			contentType: msg.properties.contentType ?? "application/json",
			messageId,
			headers: { ...msg.properties.headers, ...headers },
		};
	}
}

export default RabbitMQConsumer;
