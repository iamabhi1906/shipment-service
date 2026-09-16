import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import type { DomainEvent } from "../../domain/shipment/events/domain-event.js";
import { RabbitMQConnection } from "../../../common/rabbitmq/index.js";

@Injectable()
export class ShipmentRabbitMQEventPublisher implements EventPublisher {
	private readonly logger = new Logger(ShipmentRabbitMQEventPublisher.name);
	constructor(private readonly rabbitmqConnection: RabbitMQConnection) {}

	async publish<T extends DomainEvent>(event: T): Promise<void> {
		const routingKey = `shipment.${this.deriveRoutingKey(event.constructor.name)}`;
		const messageId = randomUUID();
		const success = await this.rabbitmqConnection.publishToTopicExchange({
			routingKey,
			payload: event,
			messageId,
			headers: { eventType: event.constructor.name },
		});

		if (!success) {
			this.logger.log(`Event Publish Error:- ${event.constructor.name} - ${JSON.stringify(event)}`);
		}
	}

	async publishAll<T extends DomainEvent>(events: T[]): Promise<void> {
		for (const event of events) {
			await this.publish(event);
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

export default ShipmentRabbitMQEventPublisher;
