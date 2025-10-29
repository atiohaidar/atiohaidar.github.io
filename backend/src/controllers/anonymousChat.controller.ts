import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import { AnonymousMessage, AnonymousMessageCreateSchema } from "../models/types";
import { AnonymousChatService } from "../services/chats";

// Get anonymous messages
export class AnonymousMessageList extends OpenAPIRoute {
	schema = {
		tags: ["Anonymous Chat"],
		summary: "Get all anonymous messages",
		responses: {
			"200": {
				description: "List of anonymous messages",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							messages: z.array(AnonymousMessage),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const chatService = new AnonymousChatService(c.env);
		const messages = await chatService.getMessages();

		return c.json({
			success: true,
			messages,
		});
	}
}

// Send anonymous message
export class AnonymousMessageSend extends OpenAPIRoute {
	schema = {
		tags: ["Anonymous Chat"],
		summary: "Send anonymous message",
		request: {
			body: {
				content: {
					"application/json": {
						schema: AnonymousMessageCreateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Message sent",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: AnonymousMessage,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof AnonymousMessageCreateSchema>();
		const { sender_id, content, reply_to_id } = data.body;

		const chatService = new AnonymousChatService(c.env);
		const message = await chatService.sendMessage(sender_id, content, reply_to_id);

		return c.json({
			success: true,
			message,
		});
	}
}
