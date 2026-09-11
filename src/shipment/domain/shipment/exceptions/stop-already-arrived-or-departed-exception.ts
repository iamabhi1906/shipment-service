export class StopAlreadyArrivedOrDepartedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Stop has already arrived or departed");
	}
}
