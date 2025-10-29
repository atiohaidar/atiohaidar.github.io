import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../models/types";
import {
	Message,
	MessageCreateSchema,
	Conversation,
	GroupChat,
	GroupChatCreateSchema,
	GroupChatUpdateSchema,
	GroupMember,
	GroupMemberAddSchema,
} from "../models/types";
import { verifyAuth } from "../utils/auth";
import { ChatService } from "../services/chats";
import { getUser } from "../services/users";

// Get user conversations
export class ConversationList extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "List user conversations",
		security: [{ BearerAuth: [] }],
		responses: {
			"200": {
				description: "List of conversations",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							conversations: z.array(Conversation),
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

		const chatService = new ChatService(c.env);
		const conversations = await chatService.getUserConversations(user.username);

		return c.json({
			success: true,
			conversations,
		});
	}
}

// Get or create conversation with another user
export class ConversationGetOrCreate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Get or create conversation with another user",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				username: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Conversation details",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							conversation: Conversation,
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

		const { username } = c.req.param();
		
		if (username === user.username) {
			return c.json({ error: "Cannot create conversation with yourself" }, 400);
		}

		const chatService = new ChatService(c.env);
		const conversation = await chatService.getOrCreateConversation(user.username, username);

		return c.json({
			success: true,
			conversation,
		});
	}
}

// Get conversation messages
export class ConversationMessages extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Get conversation messages",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				conversationId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "List of messages",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							messages: z.array(Message),
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

		const { conversationId } = c.req.param();

		const chatService = new ChatService(c.env);
		const messages = await chatService.getConversationMessages(conversationId);

		return c.json({
			success: true,
			messages,
		});
	}
}

// Send message to conversation
export class MessageSend extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Send a message",
		security: [{ BearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: MessageCreateSchema,
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
							message: Message,
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

		const data = await this.getValidatedData<typeof MessageCreateSchema>();
		const { conversation_id, group_id, content, reply_to_id } = data.body;

		if (!conversation_id && !group_id) {
			return c.json({ error: "Either conversation_id or group_id is required" }, 400);
		}

		if (conversation_id && group_id) {
			return c.json({ error: "Cannot specify both conversation_id and group_id" }, 400);
		}

		const chatService = new ChatService(c.env);

		// If sending to group, verify membership
		if (group_id) {
			const isMember = await chatService.isGroupMember(group_id, user.username);
			if (!isMember) {
				return c.json({ error: "Not a member of this group" }, 403);
			}
		}

		const message = await chatService.sendMessage(
			user.username,
			conversation_id,
			group_id,
			content,
			reply_to_id
		);

		return c.json({
			success: true,
			message,
		});
	}
}

// List user's groups
export class GroupList extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "List user groups",
		security: [{ BearerAuth: [] }],
		responses: {
			"200": {
				description: "List of groups",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							groups: z.array(GroupChat),
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

		const chatService = new ChatService(c.env);
		const groups = await chatService.getUserGroups(user.username);

		return c.json({
			success: true,
			groups,
		});
	}
}

// Create group
export class GroupCreate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Create a group",
		security: [{ BearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: GroupChatCreateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Group created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							group: GroupChat,
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

		const data = await this.getValidatedData<typeof GroupChatCreateSchema>();
		const { name, description } = data.body;

		const chatService = new ChatService(c.env);
		const group = await chatService.createGroup(name, description, user.username);

		return c.json({
			success: true,
			group,
		});
	}
}

// Get group details
export class GroupGet extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Get group details",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Group details",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							group: GroupChat,
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

		const { groupId } = c.req.param();

		const chatService = new ChatService(c.env);
		
		// Verify membership
		const isMember = await chatService.isGroupMember(groupId, user.username);
		if (!isMember) {
			return c.json({ error: "Not a member of this group" }, 403);
		}

		const group = await chatService.getGroup(groupId);
		if (!group) {
			return c.json({ error: "Group not found" }, 404);
		}

		return c.json({
			success: true,
			group,
		});
	}
}

// Update group
export class GroupUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Update group details",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: GroupChatUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Group updated",
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

		const { groupId } = c.req.param();
		const data = await this.getValidatedData<typeof GroupChatUpdateSchema>();
		const { name, description } = data.body;

		const chatService = new ChatService(c.env);
		
		// Verify admin status
		const isAdmin = await chatService.isGroupAdmin(groupId, user.username);
		if (!isAdmin) {
			return c.json({ error: "Only group admins can update group details" }, 403);
		}

		await chatService.updateGroup(groupId, name, description);

		return c.json({
			success: true,
		});
	}
}

// Delete group
export class GroupDelete extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Delete group",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Group deleted",
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

		const { groupId } = c.req.param();

		const chatService = new ChatService(c.env);
		
		// Verify admin status
		const isAdmin = await chatService.isGroupAdmin(groupId, user.username);
		if (!isAdmin) {
			return c.json({ error: "Only group admins can delete the group" }, 403);
		}

		await chatService.deleteGroup(groupId);

		return c.json({
			success: true,
		});
	}
}

// Get group messages
export class GroupMessages extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Get group messages",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "List of messages",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							messages: z.array(Message),
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

		const { groupId } = c.req.param();

		const chatService = new ChatService(c.env);
		
		// Verify membership
		const isMember = await chatService.isGroupMember(groupId, user.username);
		if (!isMember) {
			return c.json({ error: "Not a member of this group" }, 403);
		}

		const messages = await chatService.getGroupMessages(groupId);

		return c.json({
			success: true,
			messages,
		});
	}
}

// Get group members
export class GroupMembers extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Get group members",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "List of members",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							members: z.array(GroupMember),
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

		const { groupId } = c.req.param();

		const chatService = new ChatService(c.env);
		
		// Verify membership
		const isMember = await chatService.isGroupMember(groupId, user.username);
		if (!isMember) {
			return c.json({ error: "Not a member of this group" }, 403);
		}

		const members = await chatService.getGroupMembers(groupId);

		return c.json({
			success: true,
			members,
		});
	}
}

// Add member to group
export class GroupAddMember extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Add member to group",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: GroupMemberAddSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Member added",
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

		const { groupId } = c.req.param();
		const body = await c.req.json();
		const parsedBody = GroupMemberAddSchema.safeParse(body);
		if (!parsedBody.success) {
			return c.json({
				success: false,
				error: "Invalid request payload",
				details: parsedBody.error.flatten(),
			}, 400);
		}
		const { user_username, role } = parsedBody.data;

		const targetUser = await getUser(c.env.DB, user_username);
		if (!targetUser) {
			return c.json({ error: "User not found" }, 404);
		}

		const chatService = new ChatService(c.env);
		
		// Verify admin status
		const isAdmin = await chatService.isGroupAdmin(groupId, user.username);
		if (!isAdmin) {
			return c.json({ error: "Only group admins can add members" }, 403);
		}

		await chatService.addGroupMember(groupId, user_username, role);

		return c.json({
			success: true,
		});
	}
}

// Remove member from group
export class GroupRemoveMember extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Remove member from group",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
				username: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Member removed",
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

		const { groupId, username } = c.req.param();

		const chatService = new ChatService(c.env);
		
		// Verify admin status
		const isAdmin = await chatService.isGroupAdmin(groupId, user.username);
		if (!isAdmin) {
			return c.json({ error: "Only group admins can remove members" }, 403);
		}

		// Cannot remove yourself if you're the last admin
		if (username === user.username) {
			const members = await chatService.getGroupMembers(groupId);
			const admins = members.filter((m: any) => m.role === "admin");
			if (admins.length === 1) {
				return c.json({ error: "Cannot remove the last admin. Promote another member first" }, 400);
			}
		}

		await chatService.removeGroupMember(groupId, username);

		return c.json({
			success: true,
		});
	}
}

// Update member role
export class GroupUpdateMemberRole extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Update member role",
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string(),
				username: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							role: z.enum(["admin", "member"]),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Member role updated",
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

		const { groupId, username } = c.req.param();
		const body = await c.req.json();
		const { role } = body;

		const chatService = new ChatService(c.env);
		
		// Verify admin status
		const isAdmin = await chatService.isGroupAdmin(groupId, user.username);
		if (!isAdmin) {
			return c.json({ error: "Only group admins can update member roles" }, 403);
		}

		await chatService.updateMemberRole(groupId, username, role);

		return c.json({
			success: true,
		});
	}
}
