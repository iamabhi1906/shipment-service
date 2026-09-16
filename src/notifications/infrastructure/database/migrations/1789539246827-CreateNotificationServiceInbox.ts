import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateNotificationServiceInbox1789539246827 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				schema: "notifications",
				name: "inbox",
				columns: [
					{
						name: "id",
						type: "varchar",
						length: "255",
						isPrimary: true,
						isNullable: false,
					},
					{
						name: "event_type",
						type: "varchar",
						length: "255",
						isNullable: false,
					},
					{
						name: "payload",
						type: "jsonb",
						isNullable: false,
					},
					{
						name: "received_at",
						type: "timestamp with time zone",
						default: "CURRENT_TIMESTAMP",
					},
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("notifications.inbox", true);
	}
}
