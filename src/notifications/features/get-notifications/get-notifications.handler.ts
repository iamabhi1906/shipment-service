import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetNotificationByIdQuery, GetNotificationsQuery } from "./get-notifications.query.js";
import {
	NOTIFICATION_REPOSITORY_TOKEN,
	type NotificationRepository,
} from "../../domain/notification/repositories/notification.repository.js";
import { NotificationNotFoundException } from "../../domain/notification/exceptions/index.js";
import { type NotificationDto, toNotificationDto } from "./get-notifications.dto.js";

@QueryHandler(GetNotificationByIdQuery)
export class GetNotificationByIdHandler implements IQueryHandler<GetNotificationByIdQuery, NotificationDto> {
	constructor(
		@Inject(NOTIFICATION_REPOSITORY_TOKEN)
		private readonly notificationRepository: NotificationRepository,
	) {}

	async execute(query: GetNotificationByIdQuery): Promise<NotificationDto> {
		const notification = await this.notificationRepository.findById(query.id);
		if (!notification) {
			throw new NotificationNotFoundException(query.id);
		}
		return toNotificationDto(notification);
	}
}

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery, NotificationDto[]> {
	constructor(
		@Inject(NOTIFICATION_REPOSITORY_TOKEN)
		private readonly notificationRepository: NotificationRepository,
	) {}

	async execute(query: GetNotificationsQuery): Promise<NotificationDto[]> {
		if (query.recipient) {
			const notifications = await this.notificationRepository.findByRecipient(query.recipient);
			return notifications.map(toNotificationDto);
		}
		const notifications = await this.notificationRepository.findAll();
		return notifications.map(toNotificationDto);
	}
}
