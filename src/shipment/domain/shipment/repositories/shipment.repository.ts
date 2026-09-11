import Shipment from "../shipment.entity.js";


export const SHIPMENT_REPOSITORY_TOKEN = "SHIPMENT_REPOSITORY_TOKEN";

export interface ShipmentRepository {
	findById(id: string): Promise<Shipment | null>;
	save(shipment: Shipment): Promise<void>;
}
