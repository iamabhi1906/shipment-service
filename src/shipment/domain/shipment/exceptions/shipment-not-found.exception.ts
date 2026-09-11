import { DomainException } from "./domain.exception.js";

export class ShipmentNotFoundException extends DomainException {
	readonly statusCode = 404;

	constructor() {
		super("Shipment not found");
	}
}
