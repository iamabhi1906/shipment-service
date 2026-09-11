import { DataSource, type DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import Shipment from "./shipment/domain/shipment/shipment.entity.js";
import Stop from "./shipment/domain/shipment/stop.entity.js";
import { CreateShipmentTable1789036651260 } from "./shipment/infrastructure/database/migrations/1789036651260-CreateShipmentTable.js";
import { CreateStopsTable1789036692109 } from "./shipment/infrastructure/database/migrations/1789036692109-CreateStopsTable.js";

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
	type: "postgres",
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
	username: process.env.POSTGRES_USER || "postgres",
	password: process.env.POSTGRES_PASSWORD || "postgres",
	database: process.env.POSTGRES_DB || "shipment_db",
	synchronize: false,
	entities: [Shipment, Stop],
	migrations: [CreateShipmentTable1789036651260, CreateStopsTable1789036692109],
	migrationsTableName: "migrations",
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
