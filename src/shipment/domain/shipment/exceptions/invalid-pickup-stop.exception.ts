import { DomainException } from "./domain.exception.js";

export class InvalidPickupStopException extends DomainException {
	readonly statusCode = 400;

	constructor() {
		super("Invalid pickup stop");
	}
}
