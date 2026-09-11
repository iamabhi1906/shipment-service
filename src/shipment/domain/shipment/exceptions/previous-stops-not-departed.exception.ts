export class PreviousStopsNotDepartedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Previous stops not departed");
		this.name = "PreviousStopsNotDepartedException";
	}
}
