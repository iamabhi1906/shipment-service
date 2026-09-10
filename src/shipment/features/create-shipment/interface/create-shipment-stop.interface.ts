import { StopType } from "../../../enums/stops.enums.js";

export interface CreateShipmentStop {
	id: string;
	sequence: number;
	type: StopType;
}
