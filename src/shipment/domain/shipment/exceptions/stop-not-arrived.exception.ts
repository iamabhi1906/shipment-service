import { DomainException } from "./domain.exception.js";

export class StopNotArrivedException extends DomainException {
	readonly statusCode = 409;

	constructor() {
		super("Stop has not arrived");
	}
}
