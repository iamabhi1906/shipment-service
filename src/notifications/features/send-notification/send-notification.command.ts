import type { NotificationChannel, NotificationType } from "../../domain/notification/enums/notification.enums.js";

export class SendNotificationCommand {
	constructor(
		public readonly recipient: string,
		public readonly subject: string,
		public readonly body: string,
		public readonly type?: NotificationType,
		public readonly channel?: NotificationChannel,
		public readonly metadata?: Record<string, any>,
	) {}
}

export default SendNotificationCommand;
