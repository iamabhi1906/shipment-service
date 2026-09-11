import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { DeliverAtStopValidator } from "./deliver-at-stop.validator.js";
import DeliverAtStopCommand from "./deliver-at-stop.command.js";

@Controller("shipments/:shipmentId/stops/:stopId/deliver")
export default class DeliverAtStopController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	async deliver(@Param() params: DeliverAtStopValidator): Promise<void> {
		await this.commandBus.execute(new DeliverAtStopCommand(params.shipmentId, params.stopId));
	}
}
