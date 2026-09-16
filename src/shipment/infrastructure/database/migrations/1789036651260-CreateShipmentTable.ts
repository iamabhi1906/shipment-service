import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateShipmentTable1789036651260 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createSchema("shipment", true);
		await queryRunner.createTable(
			new Table({
				name: "shipments",
				schema: "shipment",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, generationStrategy: "uuid", default: "uuid_generate_v4()" },
					{ name: "status", type: "enum", enum: ["in-transit", "completed"], default: "'in-transit'" },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
			}),
			true,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(new Table({ name: "shipments", schema: "shipment" }), true);
	}
}
