import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { PickupAtStopValidator } from "./pickup-at-stop.validator.js";
import PickupAtStopCommand from "./pickup-at-stop.command.js";

@Controller("shipments/:shipmentId/stops/:stopId/pickup")
export default class PickupAtStopController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	async pickup(@Param() params: PickupAtStopValidator): Promise<string> {
		await this.commandBus.execute(new PickupAtStopCommand(params.shipmentId, params.stopId));
		return `Pickup successful at ${params.stopId}`;
	}
}
