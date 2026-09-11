import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import PickupAtStopCommand from "./pickup-at-stop.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { EVENT_PUBLISHER_TOKEN, type EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { StopPickedUpEvent } from "../../domain/shipment/events/stop-picked-up.event.js";
import { ShipmentCompletedEvent } from "../../domain/shipment/events/shipment-completed.event.js";

@CommandHandler(PickupAtStopCommand)
class PickupAtStopHandler implements ICommandHandler<PickupAtStopCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		@Inject(EVENT_PUBLISHER_TOKEN)
		private readonly eventPublisher: EventPublisher,
	) {}

	async execute(command: PickupAtStopCommand): Promise<void> {
		const shipment = await this.shipmentRepository.findById(command.shipmentId);
		if (!shipment) {
			throw new ShipmentNotFoundException();
		}

		shipment.pickupAtStop(command.stopId);

		await this.shipmentRepository.save(shipment);

		await this.eventPublisher.publish(new StopPickedUpEvent(command.shipmentId, command.stopId));

		if (shipment.isCompleted()) {
			await this.eventPublisher.publish(new ShipmentCompletedEvent(command.shipmentId));
		}
	}
}

export default PickupAtStopHandler;
