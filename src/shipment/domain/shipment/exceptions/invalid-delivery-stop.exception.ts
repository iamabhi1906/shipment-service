import { DomainException } from "./domain.exception.js";

export class InvalidDeliveryStopException extends DomainException {
	readonly statusCode = 400;

	constructor() {
		super("Invalid delivery stop");
	}
}

export { ShipmentMustHaveAtLeastOneStopException } from "./shipment-must-have-stop.exception.js";
