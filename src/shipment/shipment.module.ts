import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import Shipment from "./domain/shipment/shipment.entity.js";
import Stop from "./domain/shipment/stop.entity.js";
import { Outbox } from "./infrastructure/database/entities/outbox.entity.js";
import { ShipmentTypeOrmRepository } from "./infrastructure/persistence/typeorm/shipment-typeorm.repository.js";
import { SHIPMENT_REPOSITORY_TOKEN } from "./domain/shipment/repositories/shipment.repository.js";
import CreateShipmentController from "./features/create-shipment/create-shipment.controller.js";
import CreateShipmentHandler from "./features/create-shipment/create-shipment.handler.js";
import ArriveAtStopController from "./features/arrive-at-stop/arrive-at-stop.controller.js";
import ArriveAtStopHandler from "./features/arrive-at-stop/arrive-at-stop.handler.js";
import PickupAtStopController from "./features/pickup-at-stop/pickup-at-stop.controller.js";
import PickupAtStopHandler from "./features/pickup-at-stop/pickup-at-stop.handler.js";
import DeliverAtStopController from "./features/deliver-at-stop/deliver-at-stop.controller.js";
import DeliverAtStopHandler from "./features/deliver-at-stop/deliver-at-stop.handler.js";
import GetShipmentController from "./features/get-shipment/get-shipment.controller.js";
import GetShipmentHandler from "./features/get-shipment/get-shipment.handler.js";
import { ShipmentOutboxService } from "./infrastructure/messaging/shipment-outbox.service.js";
import { ShipmentOutboxCron } from "./infrastructure/messaging/shipment-outbox.cron.js";

@Module({
	imports: [CqrsModule, TypeOrmModule.forFeature([Shipment, Stop, Outbox])],
	controllers: [
		CreateShipmentController,
		GetShipmentController,
		ArriveAtStopController,
		PickupAtStopController,
		DeliverAtStopController,
	],
	providers: [
		{
			provide: SHIPMENT_REPOSITORY_TOKEN,
			useClass: ShipmentTypeOrmRepository,
		},
		ShipmentTypeOrmRepository,
		ShipmentOutboxService,
		ShipmentOutboxCron,
		CreateShipmentHandler,
		ArriveAtStopHandler,
		PickupAtStopHandler,
		DeliverAtStopHandler,
		GetShipmentHandler,
	],
	exports: [TypeOrmModule, SHIPMENT_REPOSITORY_TOKEN, ShipmentTypeOrmRepository, ShipmentOutboxService],
})
export class ShipmentModule {}
