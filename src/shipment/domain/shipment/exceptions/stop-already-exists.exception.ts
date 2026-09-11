import { DomainException } from "./domain.exception.js";

export class StopAlreadyExistsException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Stop already exists");
	}
}
