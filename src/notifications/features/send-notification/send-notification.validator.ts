import { IsEmail, IsObject, IsOptional, IsString, MinLength } from "class-validator";

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
	@IsObject()
	metadata?: Record<string, any>;
}
