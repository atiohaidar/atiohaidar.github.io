import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import {
	Discussion,
	DiscussionCreateSchema,
	DiscussionReply,
	DiscussionReplyCreateSchema,
} from "../models/types";
import { verifyAuth } from "../utils/auth";
import { DiscussionService } from "../services/discussions";

// List all discussions
export class DiscussionList extends OpenAPIRoute {
	schema = {
		tags: ["Discussions"],
		summary: "List all discussions",
		responses: {
			"200": {
				description: "List of discussions",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							discussions: z.array(Discussion),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const discussionService = new DiscussionService(c.env);
		const discussions = await discussionService.listDiscussions();

		return c.json({
			success: true,
			discussions,
		});
	}
}

// Get single discussion with replies
export class DiscussionGet extends OpenAPIRoute {
	schema = {
		tags: ["Discussions"],
		summary: "Get discussion details with replies",
		request: {
			params: z.object({
				discussionId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Discussion details",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							discussion: Discussion.extend({
								replies: z.array(DiscussionReply),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { discussionId } = c.req.param();

		const discussionService = new DiscussionService(c.env);
		const discussion = await discussionService.getDiscussion(discussionId);

		return c.json({
			success: true,
			discussion,
		});
	}
}

// Create new discussion
export class DiscussionCreate extends OpenAPIRoute {
	schema = {
		tags: ["Discussions"],
		summary: "Create new discussion (authenticated or anonymous)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: DiscussionCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Discussion created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							discussion: Discussion.extend({
								replies: z.array(DiscussionReply),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const body = await c.req.json();
		const { title, content, creator_name } = body;

		// Try to get authenticated user (optional)
		let user = null;
		try {
			user = await verifyAuth(c);
		} catch (e) {
			// Not authenticated, that's okay for discussions
		}

		const discussionService = new DiscussionService(c.env);
		
		// If authenticated, use their username and name
		// If not, use provided creator_name or "Anonymous"
		const username = user ? user.username : null;
		const name = user ? user.name : (creator_name || "Anonymous");

		const discussion = await discussionService.createDiscussion(
			title,
			content,
			username,
			name
		);

		return c.json(
			{
				success: true,
				discussion,
			},
			201
		);
	}
}

// Create reply to discussion
export class DiscussionReplyCreate extends OpenAPIRoute {
	schema = {
		tags: ["Discussions"],
		summary: "Reply to a discussion (authenticated or anonymous)",
		request: {
			params: z.object({
				discussionId: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: DiscussionReplyCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Reply created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							reply: DiscussionReply,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { discussionId } = c.req.param();
		const body = await c.req.json();
		const { content, creator_name } = body;

		// Try to get authenticated user (optional)
		let user = null;
		try {
			user = await verifyAuth(c);
		} catch (e) {
			// Not authenticated, that's okay for discussions
		}

		const discussionService = new DiscussionService(c.env);
		
		// If authenticated, use their username and name
		// If not, use provided creator_name or "Anonymous"
		const username = user ? user.username : null;
		const name = user ? user.name : (creator_name || "Anonymous");

		const reply = await discussionService.createReply(
			discussionId,
			content,
			username,
			name
		);

		return c.json(
			{
				success: true,
				reply,
			},
			201
		);
	}
}

// Delete discussion
export class DiscussionDelete extends OpenAPIRoute {
	schema = {
		tags: ["Discussions"],
		summary: "Delete a discussion (creator or admin only)",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				discussionId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Discussion deleted",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const user = await verifyAuth(c);
		if (!user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const { discussionId } = c.req.param();

		const discussionService = new DiscussionService(c.env);
		const isAdmin = user.role === "admin";
		
		await discussionService.deleteDiscussion(discussionId, user.username, isAdmin);

		return c.json({
			success: true,
		});
	}
}
