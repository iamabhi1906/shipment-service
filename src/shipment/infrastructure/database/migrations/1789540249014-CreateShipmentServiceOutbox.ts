import { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm/browser";

export class CreateShipmentServiceOutbox1789540249014 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				schema: "shipment",
				name: "outbox",
				columns: [
					{ name: "id", type: "uuid", isPrimary: true, generationStrategy: "uuid", default: "gen_random_uuid()" },
					{ name: "event_type", type: "varchar", length: "255", isNullable: false },
					{ name: "payload", type: "jsonb", isNullable: false },
					{ name: "acknowledged", type: "enum", enum: ["pending", "processed"], default: `'pending'` },
					{ name: "created_at", type: "timestamp with time zone", default: "CURRENT_TIMESTAMP" },
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(new Table({ name: "outbox", schema: "shipment" }), true);
	}
}
