import type Inbox from "../inbox.entity.js";

export const INBOX_REPOSITORY_TOKEN = Symbol("INBOX_REPOSITORY_TOKEN");

export interface InboxRepository {
	findById(id: string): Promise<Inbox | null>;
	exists(id: string): Promise<boolean>;
	save(inbox: Inbox): Promise<void>;
}
