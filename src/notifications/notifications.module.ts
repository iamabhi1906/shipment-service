import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import Notification from "./domain/notification/notification.entity.js";
import Inbox from "./domain/notification/inbox.entity.js";
import { NOTIFICATION_REPOSITORY_TOKEN } from "./domain/notification/repositories/notification.repository.js";
import { INBOX_REPOSITORY_TOKEN } from "./domain/notification/repositories/inbox.repository.js";
import { EMAIL_SENDER_TOKEN } from "./domain/notification/ports/email-sender.interface.js";
import { NOTIFICATION_EVENT_PUBLISHER_TOKEN } from "./domain/notification/events/event-publisher.interface.js";
import { NotificationTypeOrmRepository } from "./infrastructure/persistence/typeorm/notification-typeorm.repository.js";
import { InboxTypeOrmRepository } from "./infrastructure/persistence/typeorm/inbox-typeorm.repository.js";
import { NodemailerSmtpSender } from "./infrastructure/email/nodemailer-smtp-sender.js";
import { RabbitMQModule } from "../common/rabbitmq/rabbitmq.module.js";
import { RabbitMQEventPublisher } from "./infrastructure/messaging/rabbitmq/rabbitmq-event.publisher.js";
import { RabbitMQConsumer } from "./infrastructure/messaging/rabbitmq/rabbitmq.consumer.js";
import SendNotificationHandler from "./features/send-notification/send-notification.handler.js";
import SendNotificationController from "./features/send-notification/send-notification.controller.js";
import {
	GetNotificationByIdHandler,
	GetNotificationsHandler,
} from "./features/get-notifications/get-notifications.handler.js";
import GetNotificationsController from "./features/get-notifications/get-notifications.controller.js";
import ProcessInboxEventHandler from "./features/process-inbox-event/process-inbox-event.handler.js";
import NotificationsService from "./notifications.service.js";

@Module({
	imports: [CqrsModule, TypeOrmModule.forFeature([Notification, Inbox]), RabbitMQModule],
	controllers: [SendNotificationController, GetNotificationsController],
	providers: [
		// Domain Repositories & Ports
		{
			provide: NOTIFICATION_REPOSITORY_TOKEN,
			useClass: NotificationTypeOrmRepository,
		},
		{
			provide: INBOX_REPOSITORY_TOKEN,
			useClass: InboxTypeOrmRepository,
		},
		{
			provide: EMAIL_SENDER_TOKEN,
			useClass: NodemailerSmtpSender,
		},
		{
			provide: NOTIFICATION_EVENT_PUBLISHER_TOKEN,
			useClass: RabbitMQEventPublisher,
		},
		// Concrete Infrastructure Services
		NotificationTypeOrmRepository,
		InboxTypeOrmRepository,
		NodemailerSmtpSender,
		RabbitMQEventPublisher,
		RabbitMQConsumer,
		// CQRS Handlers
		SendNotificationHandler,
		GetNotificationByIdHandler,
		GetNotificationsHandler,
		ProcessInboxEventHandler,
		// Facade Service
		NotificationsService,
	],
	exports: [
		TypeOrmModule,
		NOTIFICATION_REPOSITORY_TOKEN,
		INBOX_REPOSITORY_TOKEN,
		EMAIL_SENDER_TOKEN,
		NOTIFICATION_EVENT_PUBLISHER_TOKEN,
		RabbitMQEventPublisher,
		NotificationsService,
	],
})
export class NotificationsModule {}

export default NotificationsModule;
