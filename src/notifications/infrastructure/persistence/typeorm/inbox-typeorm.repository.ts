import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Inbox from "../../../domain/notification/inbox.entity.js";
import type { InboxRepository } from "../../../domain/notification/repositories/inbox.repository.js";

@Injectable()
export class InboxTypeOrmRepository implements InboxRepository {
	constructor(
		@InjectRepository(Inbox)
		private readonly repository: Repository<Inbox>,
	) {}

	async findById(id: string): Promise<Inbox | null> {
		return await this.repository.findOne({ where: { id } });
	}

	async exists(id: string): Promise<boolean> {
		const count = await this.repository.count({ where: { id } });
		return count > 0;
	}

	async save(inbox: Inbox): Promise<void> {
		await this.repository.save(inbox);
	}
}
