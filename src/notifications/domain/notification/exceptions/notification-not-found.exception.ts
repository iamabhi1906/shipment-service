import { DomainException } from "./domain.exception.js";

export class NotificationNotFoundException extends DomainException {
	readonly statusCode = 404;

	constructor(id?: string) {
		super(id ? `Notification with ID '${id}' not found` : "Notification not found");
	}
}
