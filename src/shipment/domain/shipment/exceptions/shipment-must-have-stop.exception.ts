import { DomainException } from "./domain.exception.js";

export class ShipmentMustHaveStopException extends DomainException {
	readonly statusCode = 400;

	constructor() {
		super("Shipment must contain at least one stop");
	}
}

export class ShipmentMustHaveAtLeastOneStopException extends ShipmentMustHaveStopException {}
