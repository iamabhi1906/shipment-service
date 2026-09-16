import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import CreateShipmentCommand from "./create-shipment.command.js";
import Stop from "../../domain/shipment/stop.entity.js";
import Shipment from "../../domain/shipment/shipment.entity.js";
import ShipmentCreatedEvent from "../../domain/shipment/events/shipment-created.event.js";
import { ShipmentOutboxService } from "../../infrastructure/messaging/shipment-outbox.service.js";

@CommandHandler(CreateShipmentCommand)
class CreateShipmentHandler implements ICommandHandler<CreateShipmentCommand> {
	constructor(private readonly shipmentOutboxService: ShipmentOutboxService) {}

	async execute(command: CreateShipmentCommand): Promise<Shipment> {
		const stops = command.stops.map((stop) => Stop.create(stop.id, stop.sequence, stop.type));
		const shipment = Shipment.create(stops);

		const event = new ShipmentCreatedEvent(
			shipment.getId(),
			shipment.getStops().map((stop) => stop.getId()),
		);
		await this.shipmentOutboxService.saveShipmentAndEvents(shipment, event);
		return shipment;
	}
}

export default CreateShipmentHandler;
