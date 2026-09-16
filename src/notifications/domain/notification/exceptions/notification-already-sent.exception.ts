import { DomainException } from "./domain.exception.js";

export class NotificationAlreadySentException extends DomainException {
	readonly statusCode = 400;

	constructor(id?: string) {
		super(id ? `Notification with ID '${id}' has already been sent` : "Notification has already been sent");
	}
}
