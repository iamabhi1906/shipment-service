import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SendNotificationValidator } from "./send-notification.validator.js";
import SendNotificationCommand from "./send-notification.command.js";

@Controller("notifications")
export class SendNotificationController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	async sendNotification(@Body() body: SendNotificationValidator) {
		return await this.commandBus.execute(
			new SendNotificationCommand(body.recipient, body.subject, body.body, body.metadata),
		);
	}
}

export default SendNotificationController;
