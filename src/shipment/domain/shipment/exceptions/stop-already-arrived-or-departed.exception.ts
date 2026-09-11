export class StopAlreadyArrivedOrDepartedException extends Error {
	readonly statusCode = 400;

	constructor() {
		super("Stop already arrived or departed");
		this.name = "StopAlreadyArrivedOrDepartedException";
	}
}
