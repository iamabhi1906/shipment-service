import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status: number;
		let message: string | string[] | object;
		let error: string;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "string") {
				message = exceptionResponse;
				error = exception.name;
			} else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
				const responseObj = exceptionResponse as Record<string, unknown>;
				message = (responseObj.message as string | string[] | object) ?? exception.message;
				error = (responseObj.error as string) ?? exception.name;
			} else {
				message = exception.message;
				error = exception.name;
			}
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			message = "Internal server error";
			error = "InternalServerError";
		}

		const errorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			error,
			message,
		};

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			const stack = exception instanceof Error ? exception.stack : undefined;
			const errorMessage = exception instanceof Error ? exception.message : JSON.stringify(exception);
			this.logger.error(`[${request.method}] ${request.url} - Status: ${status} - Error: ${errorMessage}`, stack);
		} else {
			this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`);
		}

		response.status(status).json(errorResponse);
	}
}
