import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ConsoleLogger } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		forceCloseConnections: true,
		logger: new ConsoleLogger({ colors: true, prefix: "shipments" }),
	});

	if (process.env.NODE_ENV === "production") {
		app.enableShutdownHooks();
	}

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port, "0.0.0.0");
}
await bootstrap();
