class DeliverAtStopCommand {
	constructor(
		public readonly shipmentId: string,
		public readonly stopId: string,
	) {}
}

export default DeliverAtStopCommand;
