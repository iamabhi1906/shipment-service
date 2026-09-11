import { DomainEvent } from "./domain-event.js";

export const EVENT_PUBLISHER_TOKEN = Symbol("EVENT_PUBLISHER");

export interface EventPublisher {
	publish<T extends DomainEvent>(event: T): Promise<void>;
	publishAll<T extends DomainEvent>(events: T[]): Promise<void>;
}
