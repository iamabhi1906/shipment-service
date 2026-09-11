import { DomainException } from "./domain.exception.js";

export class StopAlreadyArrivedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Stop already arrived");
	}
}
