export class StopNotFoundException extends Error {
	readonly statusCode = 404;

	constructor() {
		super("Stop not found");
		this.name = "StopNotFoundException";
	}
}
