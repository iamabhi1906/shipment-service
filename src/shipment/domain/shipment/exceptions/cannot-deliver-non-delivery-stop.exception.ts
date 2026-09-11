export class CannotDeliverNonDeliveryStopException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Cannot deliver a non-delivery stop");
		this.name = "CannotDeliverNonDeliveryStopException";
	}
}
