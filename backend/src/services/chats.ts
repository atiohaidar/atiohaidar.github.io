import type { Bindings } from "../models/types";

interface Message {
	id: string;
	conversation_id?: string;
	group_id?: string;
	sender_username: string;
	content: string;
	reply_to_id?: string;
	created_at: string;
}

interface Conversation {
	id: string;
	user1_username: string;
	user2_username: string;
	created_at: string;
	updated_at: string;
}

interface GroupChat {
	id: string;
	name: string;
	description?: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}

interface GroupMember {
	group_id: string;
	user_username: string;
	role: string;
	joined_at: string;
}

export class ChatService {
	constructor(private env: Bindings) {}

	// Conversation methods
	async getOrCreateConversation(user1: string, user2: string): Promise<Conversation> {
		const db = this.env.DB;
		
		// Sort usernames to ensure consistency
		const [sortedUser1, sortedUser2] = [user1, user2].sort();
		
		// Check if conversation exists
		const existing = await db
			.prepare("SELECT * FROM conversations WHERE user1_username = ? AND user2_username = ?")
			.bind(sortedUser1, sortedUser2)
			.first<Conversation>();

		if (existing) {
			return existing;
		}

		// Create new conversation
		const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		await db
			.prepare(
				"INSERT INTO conversations (id, user1_username, user2_username) VALUES (?, ?, ?)"
			)
			.bind(id, sortedUser1, sortedUser2)
			.run();

		return {
			id,
			user1_username: sortedUser1,
			user2_username: sortedUser2,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
	}

	async getUserConversations(username: string): Promise<any[]> {
		const db = this.env.DB;
		
		const conversations = await db
			.prepare(`
				SELECT 
					c.*,
					CASE 
						WHEN c.user1_username = ? THEN c.user2_username 
						ELSE c.user1_username 
					END as other_username,
					u.name as other_name,
					(SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
					(SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
				FROM conversations c
				LEFT JOIN users u ON u.username = CASE 
					WHEN c.user1_username = ? THEN c.user2_username 
					ELSE c.user1_username 
				END
				WHERE c.user1_username = ? OR c.user2_username = ?
				ORDER BY last_message_time DESC
			`)
			.bind(username, username, username, username)
			.all();

		return conversations.results || [];
	}

	// Message methods
	async sendMessage(
		senderId: string,
		conversationId: string | undefined,
		groupId: string | undefined,
		content: string,
		replyToId?: string
	): Promise<Message> {
		const db = this.env.DB;
		const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		await db
			.prepare(
				"INSERT INTO messages (id, conversation_id, group_id, sender_username, content, reply_to_id) VALUES (?, ?, ?, ?, ?, ?)"
			)
			.bind(id, conversationId || null, groupId || null, senderId, content, replyToId || null)
			.run();

		return {
			id,
			conversation_id: conversationId,
			group_id: groupId,
			sender_username: senderId,
			content,
			reply_to_id: replyToId,
			created_at: new Date().toISOString(),
		};
	}

	async getConversationMessages(conversationId: string, limit = 50): Promise<any[]> {
		const db = this.env.DB;
		
		const messages = await db
			.prepare(`
				SELECT 
					m.*,
					u.name as sender_name,
					rm.content as reply_content,
					ru.name as reply_sender_name
				FROM messages m
				LEFT JOIN users u ON u.username = m.sender_username
				LEFT JOIN messages rm ON rm.id = m.reply_to_id
				LEFT JOIN users ru ON ru.username = rm.sender_username
				WHERE m.conversation_id = ?
				ORDER BY m.created_at ASC
				LIMIT ?
			`)
			.bind(conversationId, limit)
			.all();

		return messages.results || [];
	}

	async getGroupMessages(groupId: string, limit = 50): Promise<any[]> {
		const db = this.env.DB;
		
		const messages = await db
			.prepare(`
				SELECT 
					m.*,
					u.name as sender_name,
					rm.content as reply_content,
					ru.name as reply_sender_name
				FROM messages m
				LEFT JOIN users u ON u.username = m.sender_username
				LEFT JOIN messages rm ON rm.id = m.reply_to_id
				LEFT JOIN users ru ON ru.username = rm.sender_username
				WHERE m.group_id = ?
				ORDER BY m.created_at ASC
				LIMIT ?
			`)
			.bind(groupId, limit)
			.all();

		return messages.results || [];
	}

	// Group chat methods
	async createGroup(name: string, description: string | undefined, creatorUsername: string): Promise<GroupChat> {
		const db = this.env.DB;
		const id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		await db
			.prepare(
				"INSERT INTO group_chats (id, name, description, created_by) VALUES (?, ?, ?, ?)"
			)
			.bind(id, name, description || null, creatorUsername)
			.run();

		// Add creator as admin
		await this.addGroupMember(id, creatorUsername, "admin");

		return {
			id,
			name,
			description,
			created_by: creatorUsername,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
	}

	async getGroup(groupId: string): Promise<GroupChat | null> {
		const db = this.env.DB;
		
		const group = await db
			.prepare("SELECT * FROM group_chats WHERE id = ?")
			.bind(groupId)
			.first<GroupChat>();

		return group || null;
	}

	async getUserGroups(username: string): Promise<any[]> {
		const db = this.env.DB;
		
		const groups = await db
			.prepare(`
				SELECT 
					g.*,
					gm.role as user_role,
					(SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
					(SELECT content FROM messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) as last_message,
					(SELECT created_at FROM messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) as last_message_time
				FROM group_chats g
				INNER JOIN group_members gm ON gm.group_id = g.id
				WHERE gm.user_username = ?
				ORDER BY last_message_time DESC
			`)
			.bind(username)
			.all();

		return groups.results || [];
	}

	async updateGroup(groupId: string, name?: string, description?: string): Promise<void> {
		const db = this.env.DB;
		
		if (name) {
			await db
				.prepare("UPDATE group_chats SET name = ? WHERE id = ?")
				.bind(name, groupId)
				.run();
		}
		
		if (description !== undefined) {
			await db
				.prepare("UPDATE group_chats SET description = ? WHERE id = ?")
				.bind(description, groupId)
				.run();
		}
	}

	async deleteGroup(groupId: string): Promise<void> {
		const db = this.env.DB;
		await db.prepare("DELETE FROM group_chats WHERE id = ?").bind(groupId).run();
	}

	// Group member methods
	async addGroupMember(groupId: string, username: string, role: string = "member"): Promise<void> {
		const db = this.env.DB;
		
		await db
			.prepare(
				"INSERT OR IGNORE INTO group_members (group_id, user_username, role) VALUES (?, ?, ?)"
			)
			.bind(groupId, username, role)
			.run();
	}

	async removeGroupMember(groupId: string, username: string): Promise<void> {
		const db = this.env.DB;
		
		await db
			.prepare("DELETE FROM group_members WHERE group_id = ? AND user_username = ?")
			.bind(groupId, username)
			.run();
	}

	async getGroupMembers(groupId: string): Promise<any[]> {
		const db = this.env.DB;
		
		const members = await db
			.prepare(`
				SELECT 
					gm.*,
					u.name
				FROM group_members gm
				INNER JOIN users u ON u.username = gm.user_username
				WHERE gm.group_id = ?
				ORDER BY gm.role DESC, gm.joined_at ASC
			`)
			.bind(groupId)
			.all();

		return members.results || [];
	}

	async isGroupMember(groupId: string, username: string): Promise<boolean> {
		const db = this.env.DB;
		
		const member = await db
			.prepare("SELECT * FROM group_members WHERE group_id = ? AND user_username = ?")
			.bind(groupId, username)
			.first();

		return !!member;
	}

	async isGroupAdmin(groupId: string, username: string): Promise<boolean> {
		const db = this.env.DB;
		
		const member = await db
			.prepare("SELECT * FROM group_members WHERE group_id = ? AND user_username = ? AND role = 'admin'")
			.bind(groupId, username)
			.first();

		return !!member;
	}

	async updateMemberRole(groupId: string, username: string, role: string): Promise<void> {
		const db = this.env.DB;
		
		await db
			.prepare("UPDATE group_members SET role = ? WHERE group_id = ? AND user_username = ?")
			.bind(role, groupId, username)
			.run();
	}
}

// Anonymous chat service
export class AnonymousChatService {
	constructor(private env: Bindings) {}

	async sendMessage(senderId: string, content: string, replyToId?: string): Promise<any> {
		const db = this.env.DB;
		const id = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		await db
			.prepare(
				"INSERT INTO anonymous_messages (id, sender_id, content, reply_to_id) VALUES (?, ?, ?, ?)"
			)
			.bind(id, senderId, content, replyToId || null)
			.run();

		return {
			id,
			sender_id: senderId,
			content,
			reply_to_id: replyToId,
			created_at: new Date().toISOString(),
		};
	}

	async getMessages(limit = 100): Promise<any[]> {
		const db = this.env.DB;
		
		const messages = await db
			.prepare(`
				SELECT 
					m.*,
					rm.content as reply_content,
					rm.sender_id as reply_sender_id
				FROM anonymous_messages m
				LEFT JOIN anonymous_messages rm ON rm.id = m.reply_to_id
				ORDER BY m.created_at DESC
				LIMIT ?
			`)
			.bind(limit)
			.all();

		return messages.results || [];
	}

	async getRecentMessages(limit = 50): Promise<any[]> {
		const db = this.env.DB;

		const messages = await db
			.prepare(`
				SELECT
					m.*,
					rm.content as reply_content,
					rm.sender_id as reply_sender_id
				FROM anonymous_messages m
				LEFT JOIN anonymous_messages rm ON rm.id = m.reply_to_id
				ORDER BY m.created_at ASC
				LIMIT ?
			`)
			.bind(limit)
			.all();

		return messages.results || [];
	}
}
