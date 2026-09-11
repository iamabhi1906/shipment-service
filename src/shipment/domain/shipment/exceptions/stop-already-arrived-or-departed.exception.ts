import { DomainException } from "./domain.exception.js";

export class StopAlreadyArrivedOrDepartedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Stop has already arrived or departed");
	}
}
