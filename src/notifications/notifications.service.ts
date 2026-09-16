import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import SendNotificationCommand from "./features/send-notification/send-notification.command.js";
import {
	GetNotificationByIdQuery,
	GetNotificationsQuery,
} from "./features/get-notifications/get-notifications.query.js";
import type { NotificationChannel, NotificationType } from "./domain/notification/enums/notification.enums.js";
import type { NotificationDto } from "./features/get-notifications/get-notifications.dto.js";
import type Notification from "./domain/notification/notification.entity.js";

@Injectable()
export class NotificationsService {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	async sendNotification(
		recipient: string,
		subject: string,
		body: string,
		type?: NotificationType,
		channel?: NotificationChannel,
		metadata?: Record<string, any>,
	): Promise<Notification> {
		return await this.commandBus.execute(
			new SendNotificationCommand(recipient, subject, body, type, channel, metadata),
		);
	}

	async getNotificationById(id: string): Promise<NotificationDto> {
		return await this.queryBus.execute(new GetNotificationByIdQuery(id));
	}

	async getAllNotifications(recipient?: string): Promise<NotificationDto[]> {
		return await this.queryBus.execute(new GetNotificationsQuery(recipient));
	}
}

export default NotificationsService;
