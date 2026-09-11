import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ArriveAtStopValidator } from "./arrive-at-stop.validator.js";
import ArriveAtStopCommand from "./arrive-at-stop.command.js";

@Controller("shipments/:shipmentId/stops/:stopId/arrive")
export default class ArriveAtStopController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	async arrive(@Param() params: ArriveAtStopValidator): Promise<void> {
		await this.commandBus.execute(new ArriveAtStopCommand(params.shipmentId, params.stopId));
	}
}
