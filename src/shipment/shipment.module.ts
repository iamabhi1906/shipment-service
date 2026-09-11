import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import Shipment from "./domain/shipment/shipment.entity.js";
import Stop from "./domain/shipment/stop.entity.js";
import { ShipmentTypeOrmRepository } from "./infrastructure/persistence/typeorm/shipment-typeorm.repository.js";
import { SHIPMENT_REPOSITORY_TOKEN } from "./domain/shipment/repositories/shipment.repository.js";
import { EVENT_PUBLISHER_TOKEN } from "./domain/shipment/events/event-publisher.interface.js";
import { InMemoryEventPublisher } from "./infrastructure/messaging/in-memory-event-publisher.js";
import CreateShipmentController from "./features/create-shipment/create-shipment.controller.js";
import CreateShipmentHandler from "./features/create-shipment/create-shipment.handler.js";

@Module({
	imports: [CqrsModule, TypeOrmModule.forFeature([Shipment, Stop])],
	controllers: [CreateShipmentController],
	providers: [
		{
			provide: SHIPMENT_REPOSITORY_TOKEN,
			useClass: ShipmentTypeOrmRepository,
		},
		{
			provide: EVENT_PUBLISHER_TOKEN,
			useClass: InMemoryEventPublisher,
		},
		ShipmentTypeOrmRepository,
		InMemoryEventPublisher,
		CreateShipmentHandler,
	],
	exports: [
		TypeOrmModule,
		SHIPMENT_REPOSITORY_TOKEN,
		EVENT_PUBLISHER_TOKEN,
		ShipmentTypeOrmRepository,
		InMemoryEventPublisher,
	],
})
export class ShipmentModule {}
