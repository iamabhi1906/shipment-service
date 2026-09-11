export class StopAlreadyExistsException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Stop already exists");
		this.name = "StopAlreadyExistsException";
	}
}
