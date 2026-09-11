class ArriveAtStopCommand {
	constructor(
		public readonly shipmentId: string,
		public readonly stopId: string,
	) {}
}

export default ArriveAtStopCommand;
