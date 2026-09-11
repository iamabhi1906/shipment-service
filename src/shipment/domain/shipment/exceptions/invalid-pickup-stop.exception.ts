export class InvalidPickupStopException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Invalid pickup stop");
		this.name = "InvalidPickupStopException";
	}
}
