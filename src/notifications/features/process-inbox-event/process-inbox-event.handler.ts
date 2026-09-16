import { CommandBus, CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import ProcessInboxEventCommand from "./process-inbox-event.command.js";
import Inbox from "../../domain/notification/inbox.entity.js";
import SendNotificationCommand from "../send-notification/send-notification.command.js";
import { NotificationChannel, NotificationType } from "../../domain/notification/enums/notification.enums.js";

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

		try {
			// Idempotency check: find if message was already handled in inbox
			const existingInbox = await queryRunner.manager.findOne(Inbox, {
				where: { id: messageId },
			});

			if (existingInbox) {
				this.logger.log(`Message '${messageId}' already processed in inbox. Skipping duplicate.`);
				await queryRunner.rollbackTransaction();
				return { processed: false, reason: "duplicate" };
			}

			// Record message in Inbox
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

		// Dispatch notification based on event type
		try {
			const notificationDetails = this.createNotificationDetails(eventType, payload);

			if (notificationDetails) {
				await this.commandBus.execute(
					new SendNotificationCommand(
						notificationDetails.recipient,
						notificationDetails.subject,
						notificationDetails.body,
						notificationDetails.type,
						NotificationChannel.EMAIL,
						{
							messageId,
							eventType,
							...payload,
						},
					),
				);
			}

			return { processed: true };
		} catch (error: any) {
			this.logger.error(`Failed to trigger notification for event '${eventType}': ${error.message}`, error.stack);
			return { processed: false, reason: error.message };
		}
	}

	private createNotificationDetails(
		eventType: string,
		payload: Record<string, any>,
	): {
		recipient: string;
		subject: string;
		body: string;
		type: NotificationType;
	} | null {
		const recipient = payload.recipientEmail || payload.customerEmail || payload.email || "customer@example.com";

		const normalizedType = eventType.toLowerCase().replace(/[_-]/g, ".");

		if (normalizedType.includes("shipment.created") || normalizedType.includes("shipmentcreated")) {
			const shipmentId = payload.id || payload.shipmentId || "Unknown";
			const stopCount = Array.isArray(payload.stops) ? payload.stops.length : payload.stopIds?.length || 0;
			return {
				recipient,
				type: NotificationType.SHIPMENT_CREATED,
				subject: `Shipment #${shipmentId} has been created`,
				body: `
					<h2>Shipment Confirmation</h2>
					<p>Your shipment <strong>#${shipmentId}</strong> has been successfully booked with <strong>${stopCount}</strong> stops.</p>
					<p>We will keep you updated on the delivery progress.</p>
				`,
			};
		}

		if (normalizedType.includes("stop.arrived") || normalizedType.includes("stoparrived")) {
			const shipmentId = payload.shipmentId || "Unknown";
			const stopId = payload.stopId || payload.id || "";
			return {
				recipient,
				type: NotificationType.STOP_ARRIVED,
				subject: `Shipment Update: Driver arrived at stop`,
				body: `
					<h2>Driver Arrived</h2>
					<p>The driver has arrived at stop <strong>#${stopId}</strong> for shipment <strong>#${shipmentId}</strong>.</p>
				`,
			};
		}

		if (normalizedType.includes("stop.picked_up") || normalizedType.includes("stoppickedup")) {
			const shipmentId = payload.shipmentId || "Unknown";
			return {
				recipient,
				type: NotificationType.STOP_ARRIVED,
				subject: `Shipment Update: Package Picked Up`,
				body: `
					<h2>Package Picked Up</h2>
					<p>Your package for shipment <strong>#${shipmentId}</strong> has been picked up and is in transit.</p>
				`,
			};
		}

		if (normalizedType.includes("stop.delivered") || normalizedType.includes("stopdelivered")) {
			const shipmentId = payload.shipmentId || "Unknown";
			return {
				recipient,
				type: NotificationType.STOP_DELIVERED,
				subject: `Shipment Update: Package Delivered`,
				body: `
					<h2>Package Delivered</h2>
					<p>Your shipment <strong>#${shipmentId}</strong> has been delivered successfully.</p>
				`,
			};
		}

		if (normalizedType.includes("order.created") || normalizedType.includes("ordercreated")) {
			const orderId = payload.id || payload.orderId || "Unknown";
			return {
				recipient,
				type: NotificationType.ORDER_CREATED,
				subject: `Order Confirmation #${orderId}`,
				body: `
					<h2>Thank you for your order!</h2>
					<p>Your order <strong>#${orderId}</strong> was received and is being processed.</p>
				`,
			};
		}

		// Generic notification fallback
		return {
			recipient,
			type: NotificationType.CUSTOM,
			subject: `Notification for Event: ${eventType}`,
			body: `
				<h2>Event Notification</h2>
				<p>Received event: <strong>${eventType}</strong></p>
				<pre>${JSON.stringify(payload, null, 2)}</pre>
			`,
		};
	}
}

export default ProcessInboxEventHandler;
