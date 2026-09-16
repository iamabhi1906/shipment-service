export enum NotificationStatus {
	PENDING = "PENDING",
	SENT = "SENT",
	FAILED = "FAILED",
}

export enum NotificationChannel {
	EMAIL = "EMAIL",
	SMS = "SMS",
	PUSH = "PUSH",
	IN_APP = "IN_APP",
}

export enum NotificationType {
	SHIPMENT_CREATED = "SHIPMENT_CREATED",
	STOP_ARRIVED = "STOP_ARRIVED",
	STOP_DELIVERED = "STOP_DELIVERED",
	ORDER_CREATED = "ORDER_CREATED",
	CUSTOM = "CUSTOM",
	ALERT = "ALERT",
}
