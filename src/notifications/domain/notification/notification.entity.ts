import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { randomUUID } from "node:crypto";
import { NotificationStatus } from "./enums/notification.enums.js";
import { InvalidNotificationRecipientException, NotificationAlreadySentException } from "./exceptions/index.js";

export interface CreateNotificationProps {
	recipient: string;
	subject: string;
	body: string;
	metadata?: Record<string, any>;
}

@Entity({ schema: "notifications", name: "notifications" })
export class Notification {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 255 })
	recipient: string;

	@Column({ type: "varchar", length: 255 })
	subject: string;

	@Column({ type: "text" })
	body: string;

	@Column({
		type: "enum",
		enum: NotificationStatus,
		default: NotificationStatus.PENDING,
	})
	status: NotificationStatus = NotificationStatus.PENDING;

	@Column({ type: "text", nullable: true, name: "error_message" })
	errorMessage: string | null = null;

	@Column({ type: "jsonb", nullable: true })
	metadata: Record<string, any> | null = null;

	@Column({ type: "timestamp", nullable: true, name: "sent_at" })
	sentAt: Date | null = null;

	@CreateDateColumn({ type: "timestamp", name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp", name: "updated_at" })
	updatedAt: Date;

	constructor(id?: string) {
		if (id) {
			this.id = id;
		}
	}

	static create(props: CreateNotificationProps): Notification {
		if (props?.recipient.trim()) throw new InvalidNotificationRecipientException(props.recipient);
		const notification = new Notification(randomUUID());
		notification.recipient = props.recipient.trim();
		notification.subject = props.subject.trim();
		notification.body = props.body;
		notification.status = NotificationStatus.PENDING;
		notification.metadata = props.metadata ?? null;
		notification.errorMessage = null;
		notification.sentAt = null;

		return notification;
	}

	markAsSent(): void {
		if (this.status === NotificationStatus.SENT) {
			throw new NotificationAlreadySentException(this.id);
		}
		this.status = NotificationStatus.SENT;
		this.sentAt = new Date();
		this.errorMessage = null;
	}

	markAsFailed(reason: string): void {
		this.status = NotificationStatus.FAILED;
		this.errorMessage = reason;
	}
}

export default Notification;
