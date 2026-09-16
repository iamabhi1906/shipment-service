import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ShipmentOrmConfig } from "./shipment/infrastructure/database/config/orm.config.js";
import { ShipmentModule } from "./shipment/shipment.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { RabbitMQModule } from "./common/rabbitmq/rabbitmq.module.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync(ShipmentOrmConfig),
		RabbitMQModule,
		ShipmentModule,
		// NotificationsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
