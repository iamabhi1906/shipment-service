import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import Shipment from "./domain/shipment/shipment.entity.js";
import Stop from "./domain/shipment/stop.entity.js";
import { SHIPMENT_REPOSITORY_TOKEN } from "./domain/repositories/shipment.repository.js";
import { ShipmentTypeOrmRepository } from "./infrastructure/persistence/typeorm/shipment-typeorm.repository.js";
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
		ShipmentTypeOrmRepository,
		CreateShipmentHandler,
	],
	exports: [TypeOrmModule, SHIPMENT_REPOSITORY_TOKEN, ShipmentTypeOrmRepository],
})
export class ShipmentModule {}
