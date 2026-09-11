import { DomainException } from "./domain.exception.js";

export class StopNotFoundException extends DomainException {
	readonly statusCode = 404;

	constructor() {
		super("Stop not found");
	}
}
