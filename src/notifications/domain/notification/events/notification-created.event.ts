import type { DomainEvent } from "./domain-event.js";

export class NotificationCreatedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly subject: string,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationCreatedEvent;
