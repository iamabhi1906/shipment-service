import type Notification from "../notification.entity.js";

export const NOTIFICATION_REPOSITORY_TOKEN = Symbol("NOTIFICATION_REPOSITORY_TOKEN");

export interface NotificationRepository {
	findById(id: string): Promise<Notification | null>;
	findAll(): Promise<Notification[]>;
	findByRecipient(recipient: string): Promise<Notification[]>;
	save(notification: Notification): Promise<void>;
}
