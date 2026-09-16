export const RABBITMQ_CONSTANTS = {
	/**
	 * Single unified topic exchange used by all services and domains to publish and route messages.
	 */
	TOPIC_EXCHANGE: "app.topic.exchange",
	EXCHANGE_TYPE: "topic" as const,
	NOTIFICATION_QUEUE: "notification_queue",
	ROUTING_KEYS: {
		ALL_EVENTS: "#",
		// Shipment routing keys
		SHIPMENT_ALL: "shipment.#",
		SHIPMENT_CREATED: "shipment.created",
		SHIPMENT_COMPLETED: "shipment.completed",
		STOP_ARRIVED: "shipment.stop.arrived",
		STOP_PICKED_UP: "shipment.stop.picked_up",
		STOP_DELIVERED: "shipment.stop.delivered",
		// Order routing keys
		ORDER_ALL: "order.#",
		ORDER_CREATED: "order.created",
		// Notification routing keys
		NOTIFICATION_ALL: "notification.#",
		NOTIFICATION_SEND: "notification.send",
		NOTIFICATION_SENT: "notification.sent",
		NOTIFICATION_FAILED: "notification.failed",
	},
};
