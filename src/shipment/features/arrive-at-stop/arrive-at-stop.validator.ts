import { IsUUID } from "class-validator";

export class ArriveAtStopValidator {
	@IsUUID()
	shipmentId: string;

	@IsUUID()
	stopId: string;
}
