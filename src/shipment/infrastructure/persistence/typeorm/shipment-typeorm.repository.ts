import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Shipment from "../../../domain/shipment/shipment.entity.js";
import { ShipmentRepository } from "../../../domain/shipment/repositories/shipment.repository.js";

@Injectable()
export class ShipmentTypeOrmRepository implements ShipmentRepository {
	constructor(
		@InjectRepository(Shipment)
		private readonly repository: Repository<Shipment>,
	) {}

	async findById(id: string): Promise<Shipment | null> {
		return await this.repository.findOne({ where: { id }, relations: { stops: true } });
	}

	async save(shipment: Shipment): Promise<void> {
		await this.repository.save(shipment);
	}
}
