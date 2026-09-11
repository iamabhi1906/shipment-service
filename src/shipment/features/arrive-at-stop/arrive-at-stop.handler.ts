import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import ArriveAtStopCommand from "./arrive-at-stop.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { EVENT_PUBLISHER_TOKEN, type EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { StopArrivedEvent } from "../../domain/shipment/events/stop-arrived.event.js";

@CommandHandler(ArriveAtStopCommand)
class ArriveAtStopHandler implements ICommandHandler<ArriveAtStopCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		@Inject(EVENT_PUBLISHER_TOKEN)
		private readonly eventPublisher: EventPublisher,
	) {}

	async execute(command: ArriveAtStopCommand): Promise<void> {
		const shipment = await this.shipmentRepository.findById(command.shipmentId);
		if (!shipment) throw new ShipmentNotFoundException();
		shipment.arriveAtStop(command.stopId);
		await this.shipmentRepository.save(shipment);
		await this.eventPublisher.publish(new StopArrivedEvent(command.shipmentId, command.stopId));
	}
}

export default ArriveAtStopHandler;
