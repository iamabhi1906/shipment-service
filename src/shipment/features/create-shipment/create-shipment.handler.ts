import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import CreateShipmentCommand from "./create-shipment.command.js";
import { SHIPMENT_REPOSITORY_TOKEN, type ShipmentRepository } from "../../domain/repositories/shipment.repository.js";
import Shipment from "../../domain/shipment/shipment.entity.js";
import Stop from "../../domain/shipment/stop.entity.js";

@CommandHandler(CreateShipmentCommand)
class CreateShipmentHandler implements ICommandHandler<CreateShipmentCommand> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
	) {}

	async execute(command: CreateShipmentCommand): Promise<void> {
		const stops = command.stops.map((stop) => Stop.create(stop.id, stop.sequence, stop.type));
		const shipment = Shipment.create(stops);
		await this.shipmentRepository.save(shipment);
		const events = shipment.pullEvents();
		for (const event of events) {
			console.log(event);
		}
	}
}

export default CreateShipmentHandler;
