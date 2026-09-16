import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import amqplib, { type ChannelModel, type Channel, type Options } from "amqplib";
import { randomUUID } from "node:crypto";
import { RABBITMQ_CONSTANTS } from "./rabbitmq.constants.js";

export interface PublishMessageOptions {
	routingKey: string;
	payload: any;
	messageId?: string;
	headers?: Record<string, any>;
	options?: Options.Publish;
}

@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RabbitMQConnection.name);
	private connection: ChannelModel | null = null;
	private channel: Channel | null = null;
	private isConnecting = false;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit(): Promise<void> {
		await this.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.close();
	}

	get exchangeName(): string {
		return (
			this.configService.get<string>("RABBITMQ_TOPIC_EXCHANGE") ||
			this.configService.get<string>("RABBITMQ_EXCHANGE") ||
			RABBITMQ_CONSTANTS.TOPIC_EXCHANGE
		);
	}

	async connect(): Promise<void> {
		if (this.connection && this.channel) {
			return;
		}

		if (this.isConnecting) {
			return;
		}

		this.isConnecting = true;
		const url = this.configService.get<string>("RABBITMQ_URL")!;

		try {
			this.connection = await amqplib.connect(url);
			this.channel = await this.connection.createChannel();
			this.connection.on("error", (err) => {
				this.logger.error("RabbitMQ connection error:", err);
			});

			this.connection.on("close", () => {
				this.logger.warn("RabbitMQ connection closed. Attempting reconnect in 5s...");
				this.connection = null;
				this.channel = null;
				setTimeout(() => this.connect(), 5000);
			});
			await this.channel.assertExchange(this.exchangeName, RABBITMQ_CONSTANTS.EXCHANGE_TYPE, {
				durable: true,
			});
			this.logger.log(`RabbitMQ connected and topic exchange '${this.exchangeName}' asserted.`);
		} catch (error: any) {
			this.logger.error(`Failed to connect to RabbitMQ: ${error.message}. Retrying in 5s...`);
			this.connection = null;
			this.channel = null;
			setTimeout(() => this.connect(), 5000);
		} finally {
			this.isConnecting = false;
		}
	}

	async publishToTopicExchange(params: PublishMessageOptions): Promise<boolean> {
		if (!this.channel) {
			this.logger.warn(`Cannot publish to topic exchange '${this.exchangeName}': channel is not connected`);
			return false;
		}
		const messageId = params.messageId || randomUUID();
		const buffer = Buffer.from(typeof params.payload === "string" ? params.payload : JSON.stringify(params.payload));
		const success = this.channel.publish(this.exchangeName, params.routingKey, buffer, {
			persistent: true,
			contentType: "application/json",
			messageId,
			timestamp: Date.now(),
			headers: params.headers || {},
			...params.options,
		});

		if (success) {
			this.logger.log(`RabbitMQ Sent exchange=${this.exchangeName} key=${params.routingKey} id=${messageId}`);
		} else {
			this.logger.warn(`Failed sending key=${params.routingKey} id=${messageId}`);
		}

		return success;
	}

	getChannel(): Channel | null {
		return this.channel;
	}

	getConnection(): ChannelModel | null {
		return this.connection;
	}

	isConnected(): boolean {
		return this.connection !== null && this.channel !== null;
	}

	async close(): Promise<void> {
		try {
			if (this.channel) {
				await this.channel.close();
				this.channel = null;
			}
			if (this.connection) {
				await this.connection.close();
				this.connection = null;
			}
			this.logger.log("RabbitMQ connection closed gracefully.");
		} catch (err) {
			this.logger.error("Error closing RabbitMQ connection:", err);
		}
	}
}

export default RabbitMQConnection;
