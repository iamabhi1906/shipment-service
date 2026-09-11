import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import DeliverAtStopCommand from "./deliver-at-stop.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { EVENT_PUBLISHER_TOKEN, type EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { StopDeliveredEvent } from "../../domain/shipment/events/stop-delivered.event.js";
import { ShipmentCompletedEvent } from "../../domain/shipment/events/shipment-completed.event.js";

@CommandHandler(DeliverAtStopCommand)
class DeliverAtStopHandler implements ICommandHandler<DeliverAtStopCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		@Inject(EVENT_PUBLISHER_TOKEN)
		private readonly eventPublisher: EventPublisher,
	) {}

	async execute(command: DeliverAtStopCommand): Promise<void> {
		const shipment = await this.shipmentRepository.findById(command.shipmentId);
		if (!shipment) throw new ShipmentNotFoundException();

		shipment.deliverAtStop(command.stopId);

		await this.shipmentRepository.save(shipment);

		await this.eventPublisher.publish(new StopDeliveredEvent(command.shipmentId, command.stopId));

		if (shipment.isCompleted()) {
			await this.eventPublisher.publish(new ShipmentCompletedEvent(command.shipmentId));
		}
	}
}

export default DeliverAtStopHandler;
