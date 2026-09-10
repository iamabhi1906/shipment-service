import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import Shipment from "../../../domain/shipment/shipment.entity.js";
import Stop from "../../../domain/shipment/stop.entity.js";

export const ShipmentOrmConfig: TypeOrmModuleAsyncOptions = {
	inject: [ConfigService],

	useFactory: (config: ConfigService) => ({
		type: "postgres",

		host: config.get<string>("POSTGRES_HOST") || config.get<string>("DB_HOST") || "localhost",
		port: Number(config.get<number>("POSTGRES_PORT") || config.get<number>("DB_PORT") || 5432),

		username: config.get<string>("POSTGRES_USER") || config.get<string>("DB_USERNAME") || "postgres",
		password: config.get<string>("POSTGRES_PASSWORD") || config.get<string>("DB_PASSWORD") || "postgres",
		database: config.get<string>("POSTGRES_DB") || config.get<string>("DB_DATABASE") || "shipment_db",

		schema: config.get<string>("POSTGRES_SCHEMA") || config.get<string>("DB_SCHEMA") || "shipment",

		entities: [Shipment, Stop],
		autoLoadEntities: true,

		migrations: ["dist/shipment/infrastructure/database/migrations/*.js"],

		logging: config.get<string>("DB_LOGGING") === "true" || config.get<boolean>("DB_LOGGING") === true,
		migrationsRun: false,
		synchronize: config.get<string>("DB_SYNCHRONIZE") === "true" || config.get<boolean>("DB_SYNCHRONIZE") === true,
	}),
};
