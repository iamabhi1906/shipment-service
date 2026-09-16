import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Notification from "../../../domain/notification/notification.entity.js";
import type { NotificationRepository } from "../../../domain/notification/repositories/notification.repository.js";

@Injectable()
export class NotificationTypeOrmRepository implements NotificationRepository {
	constructor(
		@InjectRepository(Notification)
		private readonly repository: Repository<Notification>,
	) {}

	async findById(id: string): Promise<Notification | null> {
		return await this.repository.findOne({ where: { id } });
	}

	async findAll(): Promise<Notification[]> {
		return await this.repository.find({
			order: { createdAt: "DESC" },
		});
	}

	async findByRecipient(recipient: string): Promise<Notification[]> {
		return await this.repository.find({
			where: { recipient },
			order: { createdAt: "DESC" },
		});
	}

	async save(notification: Notification): Promise<void> {
		await this.repository.save(notification);
	}
}
