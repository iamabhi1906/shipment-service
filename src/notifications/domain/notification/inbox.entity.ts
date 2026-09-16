import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "notifications", name: "inbox" })
export class Inbox {
	@PrimaryColumn({ type: "varchar", length: 255 })
	id: string;

	@Column({ type: "varchar", length: 255, name: "event_type" })
	eventType: string;

	@Column({ type: "jsonb" })
	payload: Record<string, any>;

	@CreateDateColumn({ type: "timestamp with time zone", name: "received_at" })
	receivedAt: Date;

	constructor(id?: string) {
		if (id) {
			this.id = id;
		}
	}

	static create(id: string, eventType: string, payload: Record<string, any>): Inbox {
		const inbox = new Inbox(id);
		inbox.eventType = eventType;
		inbox.payload = payload;
		return inbox;
	}

	// Getters
	getId = (): string => this.id;
	getEventType = (): string => this.eventType;
	getPayload = (): Record<string, any> => this.payload;
	getReceivedAt = (): Date => this.receivedAt;
}

export default Inbox;
