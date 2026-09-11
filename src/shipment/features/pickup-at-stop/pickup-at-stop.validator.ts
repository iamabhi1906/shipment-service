import { IsUUID } from "class-validator";

export class PickupAtStopValidator {
	@IsUUID()
	shipmentId: string;

	@IsUUID()
	stopId: string;
}
