import { CommandBus, CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import ProcessInboxEventCommand from "./process-inbox-event.command.js";
import Inbox from "../../domain/notification/inbox.entity.js";
import SendNotificationCommand from "../send-notification/send-notification.command.js";

@CommandHandler(ProcessInboxEventCommand)
export class ProcessInboxEventHandler implements ICommandHandler<ProcessInboxEventCommand> {
	private readonly logger = new Logger(ProcessInboxEventHandler.name);

	constructor(
		private readonly dataSource: DataSource,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: ProcessInboxEventCommand): Promise<{ processed: boolean; reason?: string }> {
		const { messageId, eventType, payload } = command;

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		// idempotency check: find if message was already handled in inbox
		try {
			const existingInbox = await queryRunner.manager.findOne(Inbox, {
				where: { id: messageId },
			});

			if (existingInbox) {
				this.logger.log(`Message '${messageId}' already processed in inbox. Skipping duplicate.`);
				await queryRunner.rollbackTransaction();
				return { processed: false, reason: "duplicate" };
			}

			// record message in Inbox (kept permanently, not removed after processing)
			const inbox = Inbox.create(messageId, eventType, payload);
			await queryRunner.manager.save(inbox);

			await queryRunner.commitTransaction();
		} catch (err: any) {
			await queryRunner.rollbackTransaction();
			this.logger.error(`Error saving inbox record for message '${messageId}': ${err.message}`, err.stack);
			throw err;
		} finally {
			await queryRunner.release();
		}

		// dispatch notification
		try {
			const notificationDetails = this.createNotificationDetails(eventType, payload);
			if (notificationDetails) {
				await this.commandBus.execute(
					new SendNotificationCommand(
						notificationDetails.recipient,
						notificationDetails.subject,
						notificationDetails.body,
						{
							messageId,
							eventType,
							...payload,
						},
					),
				);
			}

			// mark message as acknowledged in inbox once processed successfully
			await this.acknowledge(messageId);
			return { processed: true };
		} catch (error: any) {
			this.logger.error(`Failed to trigger notification for event '${eventType}': ${error.message}`, error.stack);
			return { processed: false, reason: error.message };
		}
	}

	private async acknowledge(messageId: string): Promise<void> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		try {
			await queryRunner.startTransaction();
			const inbox = await queryRunner.manager.findOne(Inbox, {
				where: { id: messageId },
			});
			if (inbox && inbox.getAcknowledgedAt() === null) {
				inbox.acknowledge(new Date());
				await queryRunner.manager.save(inbox);
			}
			await queryRunner.commitTransaction();
		} catch (err: any) {
			await queryRunner.rollbackTransaction();
			this.logger.error(`Error acknowledging inbox record for message '${messageId}': ${err.message}`, err.stack);
		} finally {
			await queryRunner.release();
		}
	}

	private createNotificationDetails(eventType: string, payload: Record<string, unknown>) {
		const recipient = String(payload.recipientEmail ?? payload.email ?? "");
		return {
			recipient,
			subject: `Notification: ${eventType}`,
			body: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
		};
	}
}

export default ProcessInboxEventHandler;
