export class ShipmentAlreadyCompletedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Shipment already completed");
		this.name = "ShipmentAlreadyCompletedException";
	}
}
