import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import GetShipmentQuery from "./get-shipment.query.js";
import {
	SHIPMENT_REPOSITORY_TOKEN,
	type ShipmentRepository,
} from "../../domain/shipment/repositories/shipment.repository.js";
import { ShipmentNotFoundException } from "../../domain/shipment/exceptions/shipment-not-found.exception.js";
import { ShipmentDto } from "./get-shipment.dto.js";

@QueryHandler(GetShipmentQuery)
export class GetShipmentHandler implements IQueryHandler<GetShipmentQuery, ShipmentDto> {
	constructor(
		@Inject(SHIPMENT_REPOSITORY_TOKEN)
		private readonly shipmentRepository: ShipmentRepository,
	) {}

	async execute(query: GetShipmentQuery): Promise<ShipmentDto> {
		const shipment = await this.shipmentRepository.findById(query.shipmentId);
		if (!shipment) {
			throw new ShipmentNotFoundException();
		}

		return ShipmentDto.fromDomain(shipment);
	}
}

export default GetShipmentHandler;
