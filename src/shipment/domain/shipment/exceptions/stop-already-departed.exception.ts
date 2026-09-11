import { DomainException } from "./domain.exception.js";

export class StopAlreadyDepartedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Stop already departed");
	}
}
