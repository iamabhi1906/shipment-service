import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateNotificationTable1789539150284 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createSchema("notifications", true);
		await queryRunner.createTable(
			new Table({
				schema: "notifications",
				name: "notifications",
				columns: [
					{
						name: "id",
						type: "uuid",
						isPrimary: true,
						default: "gen_random_uuid()",
					},
					{
						name: "recipient",
						type: "varchar",
						length: "255",
						isNullable: false,
					},
					{
						name: "subject",
						type: "varchar",
						length: "255",
						isNullable: false,
					},
					{
						name: "body",
						type: "text",
						isNullable: false,
					},
					{
						name: "type",
						type: "varchar",
						length: "50",
						default: "'CUSTOM'",
						isNullable: false,
					},
					{
						name: "channel",
						type: "varchar",
						length: "50",
						default: "'EMAIL'",
						isNullable: false,
					},
					{
						name: "status",
						type: "varchar",
						length: "50",
						default: "'PENDING'",
						isNullable: false,
					},
					{
						name: "error_message",
						type: "text",
						isNullable: true,
					},
					{
						name: "metadata",
						type: "jsonb",
						isNullable: true,
					},
					{
						name: "sent_at",
						type: "timestamp with time zone",
						isNullable: true,
					},
					{
						name: "created_at",
						type: "timestamp with time zone",
						default: "CURRENT_TIMESTAMP",
					},
					{
						name: "updated_at",
						type: "timestamp with time zone",
						default: "CURRENT_TIMESTAMP",
					},
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("notifications.notifications", true);
	}
}
