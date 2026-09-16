import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NodemailerSmtpSender } from "./infrastructure/email/nodemailer-smtp-sender.js";
import { RabbitMQModule } from "../common/rabbitmq/rabbitmq.module.js";
import { RabbitMQConsumer } from "./infrastructure/messaging/rabbitmq/rabbitmq.consumer.js";
import Inbox from "./domain/notification/inbox.entity.js";
import { InboxTypeOrmRepository } from "./infrastructure/persistence/typeorm/inbox-typeorm.repository.js";
import { INBOX_REPOSITORY_TOKEN } from "./domain/notification/repositories/inbox.repository.js";

@Module({
	imports: [RabbitMQModule, TypeOrmModule.forFeature([Inbox])],
	providers: [
		NodemailerSmtpSender,
		RabbitMQConsumer,
		{ provide: INBOX_REPOSITORY_TOKEN, useClass: InboxTypeOrmRepository },
	],
})
export class NotificationsModule {}

export default NotificationsModule;
