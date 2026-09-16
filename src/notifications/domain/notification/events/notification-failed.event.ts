import type { DomainEvent } from "./domain-event.js";

export class NotificationFailedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly reason: string,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationFailedEvent;
