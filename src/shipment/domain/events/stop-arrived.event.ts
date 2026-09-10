import { DomainEvent } from "./domain-event.js";

export class StopArrivedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		readonly shipmentId: string,
		readonly stopId: string,
	) {
		this.occurredAt = new Date();
	}
}
