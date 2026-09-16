export class GetNotificationByIdQuery {
	constructor(public readonly id: string) {}
}

export class GetNotificationsQuery {
	constructor(public readonly recipient?: string) {}
}
