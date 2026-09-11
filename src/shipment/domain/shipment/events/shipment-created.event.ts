import { DomainEvent } from "./domain-event.js";

class ShipmentCreatedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(
		readonly shipmentId: string,
		readonly stopIds: string[],
	) {
		this.occurredAt = new Date();
	}
}

export default ShipmentCreatedEvent;
