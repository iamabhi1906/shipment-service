export class CannotPickupNonPickupStopException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Cannot pickup a stop that is not a pickup");
		this.name = "CannotPickupNonPickupStopException";
	}
}
