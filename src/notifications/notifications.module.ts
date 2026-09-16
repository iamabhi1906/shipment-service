import { Module } from "@nestjs/common";
import { NodemailerSmtpSender } from "./infrastructure/email/nodemailer-smtp-sender.js";
import { RabbitMQModule } from "../common/rabbitmq/rabbitmq.module.js";
import { RabbitMQConsumer } from "./infrastructure/messaging/rabbitmq/rabbitmq.consumer.js";

@Module({
	imports: [RabbitMQModule],
	providers: [NodemailerSmtpSender, RabbitMQConsumer],
})
export class NotificationsModule {}

export default NotificationsModule;
