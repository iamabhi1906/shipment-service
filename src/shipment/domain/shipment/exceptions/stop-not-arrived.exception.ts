export class StopNotArrivedException extends Error {
	readonly statusCode = 409;

	constructor() {
		super("Stop not arrived");
		this.name = "StopNotArrivedException";
	}
}
