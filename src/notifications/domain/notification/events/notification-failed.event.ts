import type { DomainEvent } from "./domain-event.js";
import type { NotificationChannel } from "../enums/notification.enums.js";

export class NotificationFailedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly channel: NotificationChannel,
		public readonly reason: string,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationFailedEvent;
