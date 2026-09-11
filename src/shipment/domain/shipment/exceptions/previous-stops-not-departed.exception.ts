import { DomainException } from "./domain.exception.js";

export class PreviousStopsNotDepartedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Previous stops have not departed");
	}
}
