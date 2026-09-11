import { Controller, Get, Param } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetShipmentValidator } from "./get-shipment.validator.js";
import GetShipmentQuery from "./get-shipment.query.js";
import { ShipmentDto } from "./get-shipment.dto.js";

@Controller("shipments")
export default class GetShipmentController {
	constructor(private readonly queryBus: QueryBus) {}

	@Get(":shipmentId")
	async getShipment(@Param() params: GetShipmentValidator): Promise<ShipmentDto> {
		return await this.queryBus.execute(new GetShipmentQuery(params.shipmentId));
	}
}
