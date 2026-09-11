import Shipment from "../../domain/shipment/shipment.entity.js";

export class StopDto {
	id: string;
	sequence: number;
	type: string;
	status: string;
}

export class ShipmentDto {
	id: string;
	status: string;
	stops: StopDto[];

	static fromDomain(shipment: Shipment): ShipmentDto {
		const dto = new ShipmentDto();
		dto.id = shipment.getId();
		dto.status = shipment.getStatus();
		dto.stops = (shipment.getStops() || []).map((stop) => ({
			id: stop.getId(),
			sequence: stop.getSequence(),
			type: stop.getType(),
			status: stop.getStatus(),
		}));
		return dto;
	}
}
