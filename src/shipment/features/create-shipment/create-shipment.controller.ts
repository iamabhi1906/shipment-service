import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateShipmentValidator } from "./create-shipment.validator.js";
import CreateShipmentCommand from "./create-shipment.command.js";

@Controller("shipments")
export default class CreateShipmentController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	async create(@Body() body: CreateShipmentValidator) {
		return this.commandBus.execute(new CreateShipmentCommand(body.stops));
	}
}
