import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import type Shipment from "../../domain/shipment/shipment.entity.js";
import type { DomainEvent } from "../../domain/shipment/events/domain-event.js";
import { Outbox, OutboxStatus } from "../database/entities/outbox.entity.js";

/** Persists a shipment change and its integration events in one database transaction. */
@Injectable()
export class ShipmentOutboxService {
	constructor(private readonly dataSource: DataSource) {}

	async saveShipmentAndEvents(shipment: Shipment, events: DomainEvent): Promise<void> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			await queryRunner.manager.save(shipment);

			await queryRunner.manager.save(
				Outbox,
				queryRunner.manager.create(Outbox, {
					event_type: events.constructor.name,
					payload: events,
					status: OutboxStatus.PENDING,
				}),
			);
			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}
}
