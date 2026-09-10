import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateStopsTable1789036692109 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "stops",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, generationStrategy: "uuid", default: "uuid_generate_v4()" },
					{ name: "shipment_id", type: "uuid", isNullable: false },
					{ name: "sequence", type: "integer", isNullable: false },
					{ name: "type", type: "enum", enum: ["PICKUP", "DELIVERY"], isNullable: false },
					{ name: "status", type: "enum", enum: ["IN_TRANSIT", "ARRIVED", "DEPARTED"], default: "'IN_TRANSIT'" },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
				foreignKeys: [
					{
						columnNames: ["shipment_id"],
						referencedTableName: "shipments",
						referencedColumnNames: ["id"],
						onDelete: "CASCADE",
					},
				],
				indices: [
					{
						name: "UQ_stops_shipment_sequence",
						columnNames: ["shipment_id", "sequence"],
						isUnique: true,
					},
				],
			}),
			true,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("stops");
	}
}
