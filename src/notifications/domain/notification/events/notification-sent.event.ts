import type { DomainEvent } from "./domain-event.js";

export class NotificationSentEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly sentAt: Date,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationSentEvent;
