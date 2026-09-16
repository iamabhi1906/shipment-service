export class ProcessInboxEventCommand {
	constructor(
		public readonly messageId: string,
		public readonly eventType: string,
		public readonly payload: Record<string, any>,
	) {}
}

export default ProcessInboxEventCommand;
