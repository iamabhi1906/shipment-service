export class ShipmentMustHaveStopException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Shipment must have stop");
		this.name = "ShipmentMustHaveStopException";
	}
}
