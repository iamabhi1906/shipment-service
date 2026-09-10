import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter.js";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		forceCloseConnections: true,
		logger: new ConsoleLogger({ colors: true, prefix: "shipments" }),
	});

	if (process.env.NODE_ENV === "production") {
		app.enableShutdownHooks();
	}

	app.useGlobalFilters(new GlobalExceptionFilter());

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port, "0.0.0.0");
}
await bootstrap();
