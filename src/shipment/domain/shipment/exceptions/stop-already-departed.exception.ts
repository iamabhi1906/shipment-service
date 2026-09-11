export class StopAlreadyDepartedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Stop already departed");
		this.name = "StopAlreadyDepartedException";
	}
}
