import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import SendNotificationCommand from "./send-notification.command.js";
import {
	NOTIFICATION_REPOSITORY_TOKEN,
	type NotificationRepository,
} from "../../domain/notification/repositories/notification.repository.js";
import { EMAIL_SENDER_TOKEN, type EmailSender } from "../../domain/notification/ports/email-sender.interface.js";
import {
	NOTIFICATION_EVENT_PUBLISHER_TOKEN,
	type NotificationEventPublisher,
} from "../../domain/notification/events/event-publisher.interface.js";
import Notification from "../../domain/notification/notification.entity.js";
import { NotificationChannel } from "../../domain/notification/enums/notification.enums.js";
import NotificationSentEvent from "../../domain/notification/events/notification-sent.event.js";
import NotificationFailedEvent from "../../domain/notification/events/notification-failed.event.js";
import NotificationCreatedEvent from "../../domain/notification/events/notification-created.event.js";

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
	private readonly logger = new Logger(SendNotificationHandler.name);

	constructor(
		@Inject(NOTIFICATION_REPOSITORY_TOKEN)
		private readonly notificationRepository: NotificationRepository,
		@Inject(EMAIL_SENDER_TOKEN)
		private readonly emailSender: EmailSender,
		@Inject(NOTIFICATION_EVENT_PUBLISHER_TOKEN)
		private readonly eventPublisher: NotificationEventPublisher,
	) {}

	async execute(command: SendNotificationCommand): Promise<Notification> {
		const notification = Notification.create({
			recipient: command.recipient,
			subject: command.subject,
			body: command.body,
			type: command.type,
			channel: command.channel ?? NotificationChannel.EMAIL,
			metadata: command.metadata,
		});

		await this.notificationRepository.save(notification);

		await this.eventPublisher.publish(
			new NotificationCreatedEvent(
				notification.getId(),
				notification.getRecipient(),
				notification.getSubject(),
				notification.getChannel(),
				notification.getType(),
			),
		);

		// Deliver based on channel
		if (notification.getChannel() === NotificationChannel.EMAIL) {
			const result = await this.emailSender.sendEmail({
				to: notification.getRecipient(),
				subject: notification.getSubject(),
				html: notification.getBody(),
				text: notification.getBody().replace(/<[^>]*>?/gm, ""), // simple html to text fallback
			});

			if (result.success) {
				notification.markAsSent();
				await this.notificationRepository.save(notification);

				await this.eventPublisher.publish(
					new NotificationSentEvent(
						notification.getId(),
						notification.getRecipient(),
						notification.getChannel(),
						notification.getSentAt()!,
					),
				);
				this.logger.log(`Notification ${notification.getId()} sent to ${notification.getRecipient()}`);
			} else {
				const errorMsg = result.error || "Email delivery failed";
				notification.markAsFailed(errorMsg);
				await this.notificationRepository.save(notification);

				await this.eventPublisher.publish(
					new NotificationFailedEvent(
						notification.getId(),
						notification.getRecipient(),
						notification.getChannel(),
						errorMsg,
					),
				);
				this.logger.error(`Notification ${notification.getId()} failed: ${errorMsg}`);
			}
		}

		return notification;
	}
}

export default SendNotificationHandler;
