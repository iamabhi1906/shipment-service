import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DataSource } from "typeorm";
import { RabbitMQConnection } from "../../../common/rabbitmq/index.js";
import { Outbox, OutboxStatus } from "../database/entities/outbox.entity.js";

@Injectable()
export class ShipmentOutboxCron implements OnModuleInit {
	private readonly logger = new Logger(ShipmentOutboxCron.name);
	private isRunning = false;

	constructor(
		private readonly dataSource: DataSource,
		private readonly rabbitmqConnection: RabbitMQConnection,
		private readonly configService: ConfigService,
	) {}

	onModuleInit(): void {
		void this.publishPendingEvents();
	}

	@Cron(CronExpression.EVERY_5_SECONDS, {
		name: "shipment-outbox-publisher",
		waitForCompletion: true,
	})
	handleCron(): Promise<void> {
		return this.publishPendingEvents();
	}

	private async publishPendingEvents(): Promise<void> {
		if (this.isRunning) return;
		this.isRunning = true;

		const queryRunner = this.dataSource.createQueryRunner();
		try {
			await queryRunner.connect();
			await queryRunner.startTransaction();
			const batchSize = Number(this.configService.get<string>("OUTBOX_BATCH_SIZE", "50"));
			const events = await queryRunner.manager
				.createQueryBuilder(Outbox, "outbox")
				.where("outbox.acknowledged = :status", { status: OutboxStatus.PENDING })
				.orderBy("outbox.created_at", "ASC")
				.limit(batchSize)
				.setLock("pessimistic_write")
				.setOnLocked("skip_locked")
				.getMany();

			for (const event of events) {
				const success = await this.rabbitmqConnection.publishToTopicExchange({
					routingKey: `shipment.${this.deriveRoutingKey(event.event_type)}`,
					payload: event.payload,
					messageId: event.id,
					headers: { eventType: event.event_type },
				});
				if (!success) throw new Error(`RabbitMQ did not accept outbox event ${event.id}`);

				event.status = OutboxStatus.PROCESSED;
				await queryRunner.manager.save(event);
			}
			await queryRunner.commitTransaction();
			if (events.length > 0) this.logger.log(`Published ${events.length} shipment outbox event(s)`);
		} catch (error) {
			if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
			const message = error instanceof Error ? error.message : "Unknown outbox error";
			this.logger.error(`Outbox publish deferred: ${message}`);
		} finally {
			if (!queryRunner.isReleased) await queryRunner.release();
			this.isRunning = false;
		}
	}

	private deriveRoutingKey(eventName: string): string {
		return eventName
			.replace(/^Shipment/, "")
			.replace(/Event$/, "")
			.replace(/([a-z0-9])([A-Z])/g, "$1.$2")
			.toLowerCase();
	}
}
