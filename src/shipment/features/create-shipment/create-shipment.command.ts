import { CreateShipmentStopValidator } from "./create-shipment.validator.js";

class CreateShipmentCommand {
	constructor(public readonly stops: CreateShipmentStopValidator[]) {}
}

export default CreateShipmentCommand;
