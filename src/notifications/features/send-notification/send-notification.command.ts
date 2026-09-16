export class SendNotificationCommand {
	constructor(
		public readonly recipient: string,
		public readonly subject: string,
		public readonly body: string,
		public readonly metadata?: Record<string, any>,
	) {}
}

export default SendNotificationCommand;
