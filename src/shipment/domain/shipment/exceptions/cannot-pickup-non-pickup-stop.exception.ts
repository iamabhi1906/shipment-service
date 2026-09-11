import { DomainException } from "./domain.exception.js";

export class CannotPickupNonPickupStopException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Cannot pickup a stop that is not a pickup");
	}
}
