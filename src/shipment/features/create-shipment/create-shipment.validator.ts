import { IsArray, IsEnum, IsPositive, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { StopType } from "../../enums/stops.enums.js";

class CreateShipmentStopValidator {
	@IsUUID()
	id: string;

	@IsPositive()
	sequence: number;

	@IsEnum(StopType)
	type: StopType;
}

export class CreateShipmentValidator {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateShipmentStopValidator)
	stops: CreateShipmentStopValidator[];
}
