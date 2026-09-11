import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import CreateShipmentCommand from "./create-shipment.command.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { EVENT_PUBLISHER_TOKEN, type EventPublisher } from "../../domain/shipment/events/event-publisher.interface.js";
import Stop from "../../domain/shipment/stop.entity.js";
import Shipment from "../../domain/shipment/shipment.entity.js";
import ShipmentCreatedEvent from "../../domain/shipment/events/shipment-created.event.js";

@CommandHandler(CreateShipmentCommand)
class CreateShipmentHandler implements ICommandHandler<CreateShipmentCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
		@Inject(EVENT_PUBLISHER_TOKEN)
		private readonly eventPublisher: EventPublisher,
	) {}

	async execute(command: CreateShipmentCommand): Promise<Shipment> {
		const stops = command.stops.map((stop) => Stop.create(stop.id, stop.sequence, stop.type));
		const shipment = Shipment.create(stops);

		await this.shipmentRepository.save(shipment);

		const event = new ShipmentCreatedEvent(
			shipment.getId(),
			shipment.getStops().map((stop) => stop.getId()),
		);
		await this.eventPublisher.publish(event);
		return shipment;
	}
}

export default CreateShipmentHandler;
