import type { DomainEvent } from "./domain-event.js";

export const NOTIFICATION_EVENT_PUBLISHER_TOKEN = Symbol("NOTIFICATION_EVENT_PUBLISHER");

export interface NotificationEventPublisher {
	publish<T extends DomainEvent>(event: T): Promise<void>;
	publishAll<T extends DomainEvent>(events: T[]): Promise<void>;
}
