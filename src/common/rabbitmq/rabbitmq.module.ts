import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMQConnection } from "./rabbitmq.connection.js";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [RabbitMQConnection],
	exports: [RabbitMQConnection],
})
export class RabbitMQModule {}

export default RabbitMQModule;
