import { Injectable, Logger } from "@nestjs/common";
import { EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import { DomainEvent } from "../../domain/shipment/events/domain-event.js";

@Injectable()
export class InMemoryEventPublisher implements EventPublisher {
	private readonly logger = new Logger(InMemoryEventPublisher.name);

	async publish<T extends DomainEvent>(event: T): Promise<void> {
		this.logger.log(`[Event Published] ${event.constructor.name}: ${JSON.stringify(event)}`);
	}

	async publishAll<T extends DomainEvent>(events: T[]): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}
}
