import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import SendNotificationCommand from "./features/send-notification/send-notification.command.js";
import type Notification from "./domain/notification/notification.entity.js";

@Injectable()
export class NotificationsService {
	constructor(private readonly commandBus: CommandBus) {}

	async sendNotification(
		recipient: string,
		subject: string,
		body: string,
		metadata?: Record<string, any>,
	): Promise<Notification> {
		return await this.commandBus.execute(new SendNotificationCommand(recipient, subject, body, metadata));
	}
}

export default NotificationsService;
