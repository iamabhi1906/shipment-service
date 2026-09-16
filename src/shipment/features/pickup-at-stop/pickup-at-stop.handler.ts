import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import PickupAtStopCommand from "./pickup-at-stop.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { StopPickedUpEvent } from "../../domain/shipment/events/stop-picked-up.event.js";
import { ShipmentCompletedEvent } from "../../domain/shipment/events/shipment-completed.event.js";
import type { DomainEvent } from "../../domain/shipment/events/domain-event.js";
import { ShipmentOutboxService } from "../../infrastructure/messaging/shipment-outbox.service.js";

@CommandHandler(PickupAtStopCommand)
class PickupAtStopHandler implements ICommandHandler<PickupAtStopCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		private readonly shipmentOutboxService: ShipmentOutboxService,
	) {}

	async execute(command: PickupAtStopCommand): Promise<void> {
		const shipment = await this.shipmentRepository.findById(command.shipmentId);
		if (!shipment) {
			throw new ShipmentNotFoundException();
		}

		shipment.pickupAtStop(command.stopId);

		const events: DomainEvent = new StopPickedUpEvent(command.shipmentId, command.stopId);
		if (shipment.isCompleted()) {
			await this.shipmentOutboxService.saveShipmentAndEvents(shipment, new ShipmentCompletedEvent(command.shipmentId));
		} else {
			await this.shipmentOutboxService.saveShipmentAndEvents(shipment, events);
		}
	}
}

export default PickupAtStopHandler;
