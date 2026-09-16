import { DomainException } from "./domain.exception.js";

export class NotificationDeliveryFailedException extends DomainException {
	readonly statusCode = 502;

	constructor(reason: string) {
		super(`Failed to deliver notification: ${reason}`);
	}
}
