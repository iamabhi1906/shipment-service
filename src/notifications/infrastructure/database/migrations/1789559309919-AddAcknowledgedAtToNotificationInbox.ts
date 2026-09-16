import { type MigrationInterface, type QueryRunner, TableColumn } from "typeorm";

export class AddAcknowledgedAtToNotificationInbox1789559309919 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			"notifications.inbox",
			new TableColumn({
				name: "acknowledged_at",
				type: "timestamp with time zone",
				isNullable: true,
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn("notifications.inbox", "acknowledged_at");
	}
}