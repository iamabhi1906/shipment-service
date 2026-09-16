import { IsOptional, IsUUID } from "class-validator";

export class GetNotificationParamsValidator {
	@IsUUID()
	id: string;
}

export class GetNotificationsQueryValidator {
	@IsOptional()
	recipient?: string;
}
