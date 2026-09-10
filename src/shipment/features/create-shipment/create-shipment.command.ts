import { CreateShipmentStop } from "./interface/create-shipment-stop.interface.js";

class CreateShipmentCommand {
	constructor(public readonly stops: CreateShipmentStop[]) {}
}

export default CreateShipmentCommand;
