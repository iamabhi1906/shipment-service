import type { DomainEvent } from "./domain-event.js";
import type { NotificationChannel, NotificationType } from "../enums/notification.enums.js";

export class NotificationCreatedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		public readonly notificationId: string,
		public readonly recipient: string,
		public readonly subject: string,
		public readonly channel: NotificationChannel,
		public readonly type: NotificationType,
	) {
		this.occurredAt = new Date();
	}
}

export default NotificationCreatedEvent;
