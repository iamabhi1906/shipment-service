import { DomainException } from "./domain.exception.js";

export class ShipmentAlreadyCompletedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Shipment is already completed");
	}
}
