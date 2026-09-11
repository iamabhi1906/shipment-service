export class ShipmentNotFoundException extends Error {
	readonly statusCode = 404;

	constructor() {
		super("Shipment not found");
		this.name = "ShipmentNotFoundException";
	}
}
