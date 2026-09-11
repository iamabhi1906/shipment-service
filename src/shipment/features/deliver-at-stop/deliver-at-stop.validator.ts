import { IsUUID } from "class-validator";

export class DeliverAtStopValidator {
	@IsUUID()
	shipmentId: string;

	@IsUUID()
	stopId: string;
}
