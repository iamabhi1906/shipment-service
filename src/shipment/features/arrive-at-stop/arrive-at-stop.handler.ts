import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import ArriveAtStopCommand from "./arrive-at-stop.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { StopArrivedEvent } from "../../domain/shipment/events/stop-arrived.event.js";
import { ShipmentOutboxService } from "../../infrastructure/messaging/shipment-outbox.service.js";

@CommandHandler(ArriveAtStopCommand)
class ArriveAtStopHandler implements ICommandHandler<ArriveAtStopCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		private readonly shipmentOutboxService: ShipmentOutboxService,
	) {}

	async execute(command: ArriveAtStopCommand): Promise<void> {
		const shipment = await this.shipmentRepository.findById(command.shipmentId);
		if (!shipment) throw new ShipmentNotFoundException();
		shipment.arriveAtStop(command.stopId);
		await this.shipmentOutboxService.saveShipmentAndEvents(
			shipment,
			new StopArrivedEvent(command.shipmentId, command.stopId),
		);
	}
}

export default ArriveAtStopHandler;
