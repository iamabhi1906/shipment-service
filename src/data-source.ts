import { DataSource, type DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import Shipment from "./shipment/domain/shipment/shipment.entity.js";
import Stop from "./shipment/domain/shipment/stop.entity.js";
import Notification from "./notifications/domain/notification/notification.entity.js";
import Inbox from "./notifications/domain/notification/inbox.entity.js";
import { Outbox } from "./shipment/infrastructure/database/entities/outbox.entity.js";
import { CreateShipmentTable1789036651260 } from "./shipment/infrastructure/database/migrations/1789036651260-CreateShipmentTable.js";
import { CreateStopsTable1789036692109 } from "./shipment/infrastructure/database/migrations/1789036692109-CreateStopsTable.js";
import { CreateNotificationServiceInbox1789539246827 } from "./notifications/infrastructure/database/migrations/1789539246827-CreateNotificationServiceInbox.js";
import { CreateNotificationTable1789539150284 } from "./notifications/infrastructure/database/migrations/1789539150284-CreateNotificationTable.js";
import { CreateShipmentServiceOutbox1789540249014 } from "./shipment/infrastructure/database/migrations/1789540249014-CreateShipmentServiceOutbox.js";
import { AddAcknowledgedAtToNotificationInbox1789559309919 } from "./notifications/infrastructure/database/migrations/1789559309919-AddAcknowledgedAtToNotificationInbox.js";

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
	type: "postgres",
	host: process.env.POSTGRES_HOST || "localhost",
	port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
	username: process.env.POSTGRES_USER || "postgres",
	password: process.env.POSTGRES_PASSWORD || "postgres",
	database: process.env.POSTGRES_DB || "shipment_db",
	synchronize: false,
	entities: [Shipment, Stop, Notification, Inbox, Outbox],
	migrations: [
		CreateShipmentTable1789036651260,
		CreateStopsTable1789036692109,
		CreateNotificationTable1789539150284,
		CreateNotificationServiceInbox1789539246827,
		CreateShipmentServiceOutbox1789540249014,
		AddAcknowledgedAtToNotificationInbox1789559309919,
	],
	migrationsTableName: "migrations",
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
