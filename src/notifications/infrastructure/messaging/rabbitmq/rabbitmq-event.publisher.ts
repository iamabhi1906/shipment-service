import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { DomainEvent } from "../../../domain/notification/events/domain-event.js";
import type { NotificationEventPublisher } from "../../../domain/notification/events/event-publisher.interface.js";
import { RabbitMQConnection } from "../../../../common/rabbitmq/index.js";

@Injectable()
export class RabbitMQEventPublisher implements NotificationEventPublisher {
	private readonly logger = new Logger(RabbitMQEventPublisher.name);

	constructor(private readonly rabbitmqConnection: RabbitMQConnection) {}

	async publish<T extends DomainEvent>(event: T, routingKey?: string): Promise<void> {
		const key = routingKey || `notification.${this.deriveRoutingKey(event.constructor.name)}`;

		const messageId = randomUUID();

		await this.rabbitmqConnection.publishToTopicExchange({
			routingKey: key,
			payload: event,
			messageId,
			headers: {
				eventType: event.constructor.name,
			},
		});
	}

	async publishAll<T extends DomainEvent>(events: T[]): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}

	private deriveRoutingKey(eventName: string): string {
		return eventName
			.replace(/^Notification/, "")
			.replace(/Event$/, "")
			.replace(/([a-z0-9])([A-Z])/g, "$1.$2")
			.toLowerCase();
	}
}

export default RabbitMQEventPublisher;
