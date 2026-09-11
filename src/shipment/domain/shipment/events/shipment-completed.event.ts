import { DomainEvent } from "./domain-event.js";

export class ShipmentCompletedEvent implements DomainEvent {
	readonly occurredAt: Date;

	constructor(readonly shipmentId: string) {
		this.occurredAt = new Date();
	}
}

export default ShipmentCompletedEvent;
