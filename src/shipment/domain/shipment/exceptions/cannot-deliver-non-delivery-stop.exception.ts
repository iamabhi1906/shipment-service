import { DomainException } from "./domain.exception.js";

export class CannotDeliverNonDeliveryStopException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Cannot deliver a non-delivery stop");
	}
}
