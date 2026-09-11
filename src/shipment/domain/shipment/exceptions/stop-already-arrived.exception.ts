export class StopAlreadyArrivedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Stop already arrived");
		this.name = "StopAlreadyArrivedException";
	}
}
