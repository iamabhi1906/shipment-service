import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommandBus } from "@nestjs/cqrs";
import { randomUUID } from "node:crypto";
import type { ConsumeMessage } from "amqplib";
import { RabbitMQConnection, RABBITMQ_CONSTANTS } from "../../../../common/rabbitmq/index.js";
import ProcessInboxEventCommand from "../../../features/process-inbox-event/process-inbox-event.command.js";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
	private readonly logger = new Logger(RabbitMQConsumer.name);
	private isStarted = false;

	constructor(
		private readonly rabbitmqConnection: RabbitMQConnection,
		private readonly configService: ConfigService,
		private readonly commandBus: CommandBus,
	) {}

	async onModuleInit(): Promise<void> {
		this.startConsumerWithRetry();
	}

	private async startConsumerWithRetry(attempt = 1): Promise<void> {
		if (this.isStarted) {
			return;
		}

		const channel = this.rabbitmqConnection.getChannel();
		if (!channel) {
			if (attempt <= 10) {
				this.logger.log(`Waiting for RabbitMQ channel before starting consumer (attempt ${attempt})...`);
				setTimeout(() => this.startConsumerWithRetry(attempt + 1), 2000);
			} else {
				this.logger.warn("RabbitMQ channel not ready after retries. Consumer will start once connection is ready.");
			}
			return;
		}

		try {
			await this.setupQueueAndConsume(channel);
			this.isStarted = true;
		} catch (error: any) {
			this.logger.error(`Error configuring RabbitMQ consumer: ${error.message}`, error.stack);
			setTimeout(() => this.startConsumerWithRetry(attempt + 1), 3000);
		}
	}

	private async setupQueueAndConsume(channel: any): Promise<void> {
		const exchangeName = this.rabbitmqConnection.exchangeName;
		const queueName =
			this.configService.get<string>("RABBITMQ_NOTIFICATION_QUEUE") || RABBITMQ_CONSTANTS.NOTIFICATION_QUEUE;

		// Assert single topic exchange
		await channel.assertExchange(exchangeName, RABBITMQ_CONSTANTS.EXCHANGE_TYPE, {
			durable: true,
		});

		// Assert notification queue
		await channel.assertQueue(queueName, {
			durable: true,
		});

		// Bind queue to the single topic exchange with wildcard topic routing keys
		const bindings = [
			RABBITMQ_CONSTANTS.ROUTING_KEYS.SHIPMENT_ALL,
			RABBITMQ_CONSTANTS.ROUTING_KEYS.ORDER_ALL,
			RABBITMQ_CONSTANTS.ROUTING_KEYS.NOTIFICATION_ALL,
			"#.event.#",
		];

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

				try {
					const contentStr = msg.content.toString();
					let payload: Record<string, any>;
					try {
						payload = JSON.parse(contentStr);
					} catch (jsonErr) {
						this.logger.error(`Failed to parse message JSON: ${contentStr}`);
						channel.ack(msg);
						return;
					}

					const messageId = msg.properties.messageId || payload.id || payload.messageId || randomUUID();

					const eventType =
						(msg.properties.headers?.eventType as string) ||
						payload.eventType ||
						msg.fields.routingKey ||
						"unknown.event";

					this.logger.log(
						`[RabbitMQ Message Received] id=${messageId} eventType=${eventType} routingKey=${msg.fields.routingKey}`,
					);

					await this.commandBus.execute(new ProcessInboxEventCommand(messageId, eventType, payload));

					channel.ack(msg);
				} catch (error: any) {
					this.logger.error(`Error processing RabbitMQ message: ${error.message}`, error.stack);
					channel.nack(msg, false, false);
				}
			},
			{
				noAck: false,
			},
		);

		this.logger.log(`RabbitMQ Consumer active on topic exchange '${exchangeName}' and queue '${queueName}'`);
	}
}

export default RabbitMQConsumer;
