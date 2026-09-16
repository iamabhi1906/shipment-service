import { IsEmail, IsEnum, IsObject, IsOptional, IsString, MinLength } from "class-validator";
import { NotificationChannel, NotificationType } from "../../domain/notification/enums/notification.enums.js";

export class SendNotificationValidator {
	@IsEmail()
	recipient: string;

	@IsString()
	@MinLength(1)
	subject: string;

	@IsString()
	@MinLength(1)
	body: string;

	@IsOptional()
	@IsEnum(NotificationType)
	type?: NotificationType;

	@IsOptional()
	@IsEnum(NotificationChannel)
	channel?: NotificationChannel;

	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>;
}
