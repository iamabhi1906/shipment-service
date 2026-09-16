import { DomainException } from "./domain.exception.js";

export class InvalidNotificationRecipientException extends DomainException {
	readonly statusCode = 400;

	constructor(recipient: string) {
		super(`Invalid notification recipient: '${recipient}'`);
	}
}
