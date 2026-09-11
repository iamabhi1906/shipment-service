export class ShipmentMustHaveAtLeastOneStopException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Shipment must have at least one stop");
		this.name = "ShipmentMustHaveAtLeastOneStopException";
	}
}
