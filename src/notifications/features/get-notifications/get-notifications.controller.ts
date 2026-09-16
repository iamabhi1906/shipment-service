import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetNotificationParamsValidator, GetNotificationsQueryValidator } from "./get-notifications.validator.js";
import { GetNotificationByIdQuery, GetNotificationsQuery } from "./get-notifications.query.js";
import type { NotificationDto } from "./get-notifications.dto.js";

@Controller("notifications")
export class GetNotificationsController {
	constructor(private readonly queryBus: QueryBus) {}

	@Get()
	async getAll(@Query() query: GetNotificationsQueryValidator): Promise<NotificationDto[]> {
		return await this.queryBus.execute(new GetNotificationsQuery(query.recipient));
	}

	@Get(":id")
	async getById(@Param() params: GetNotificationParamsValidator): Promise<NotificationDto> {
		return await this.queryBus.execute(new GetNotificationByIdQuery(params.id));
	}
}

export default GetNotificationsController;
