import type { DomainEvent } from "./domain-event.js";
import type { NotificationChannel } from "../enums/notification.enums.js";

export class NotificationSentEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly channel: NotificationChannel,
		public readonly sentAt: Date,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationSentEvent;
