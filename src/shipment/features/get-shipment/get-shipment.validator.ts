import { IsUUID } from "class-validator";

export class GetShipmentValidator {
	@IsUUID()
	shipmentId: string;
}
