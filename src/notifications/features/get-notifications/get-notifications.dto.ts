import type {
	NotificationChannel,
	NotificationStatus,
	NotificationType,
} from "../../domain/notification/enums/notification.enums.js";
import type Notification from "../../domain/notification/notification.entity.js";

export interface NotificationDto {
	id: string;
	recipient: string;
	subject: string;
	body: string;
	type: NotificationType;
	channel: NotificationChannel;
	status: NotificationStatus;
	errorMessage: string | null;
	metadata: Record<string, any> | null;
	sentAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export function toNotificationDto(notification: Notification): NotificationDto {
	return {
		id: notification.getId(),
		recipient: notification.getRecipient(),
		subject: notification.getSubject(),
		body: notification.getBody(),
		type: notification.getType(),
		channel: notification.getChannel(),
		status: notification.getStatus(),
		errorMessage: notification.getErrorMessage(),
		metadata: notification.getMetadata(),
		sentAt: notification.getSentAt(),
		createdAt: notification.getCreatedAt(),
		updatedAt: notification.getUpdatedAt(),
	};
}
