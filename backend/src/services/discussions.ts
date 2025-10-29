import type { Bindings } from "../models/types";

export class DiscussionService {
	constructor(private env: Bindings) {}

	// Generate unique ID
	private generateId(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	// List all discussions
	async listDiscussions() {
		const stmt = this.env.DB.prepare(`
			SELECT 
				d.*,
				COUNT(dr.id) as reply_count
			FROM discussions d
			LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
			GROUP BY d.id
			ORDER BY d.created_at DESC
		`);
		const result = await stmt.all();
		return result.results || [];
	}

	// Get single discussion with replies
	async getDiscussion(discussionId: string) {
		// Get discussion details
		const discussionStmt = this.env.DB.prepare(`
			SELECT * FROM discussions WHERE id = ?
		`);
		const discussion = await discussionStmt.bind(discussionId).first();

		if (!discussion) {
			throw new Error("Discussion not found");
		}

		// Get replies
		const repliesStmt = this.env.DB.prepare(`
			SELECT * FROM discussion_replies 
			WHERE discussion_id = ? 
			ORDER BY created_at ASC
		`);
		const repliesResult = await repliesStmt.bind(discussionId).all();
		const replies = repliesResult.results || [];

		return {
			...discussion,
			replies,
		};
	}

	// Create new discussion
	async createDiscussion(
		title: string,
		content: string,
		creatorUsername: string | null,
		creatorName: string
	) {
		const id = this.generateId("disc");
		const isAnonymous = creatorUsername ? 0 : 1;

		const stmt = this.env.DB.prepare(`
			INSERT INTO discussions (id, title, content, creator_username, creator_name, is_anonymous, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`);

		await stmt
			.bind(id, title, content, creatorUsername, creatorName, isAnonymous)
			.run();

		return await this.getDiscussion(id);
	}

	// Create reply to discussion
	async createReply(
		discussionId: string,
		content: string,
		creatorUsername: string | null,
		creatorName: string
	) {
		// Check if discussion exists
		const discussionStmt = this.env.DB.prepare(`
			SELECT id FROM discussions WHERE id = ?
		`);
		const discussion = await discussionStmt.bind(discussionId).first();

		if (!discussion) {
			throw new Error("Discussion not found");
		}

		const id = this.generateId("reply");
		const isAnonymous = creatorUsername ? 0 : 1;

		const stmt = this.env.DB.prepare(`
			INSERT INTO discussion_replies (id, discussion_id, content, creator_username, creator_name, is_anonymous, created_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
		`);

		await stmt
			.bind(id, discussionId, content, creatorUsername, creatorName, isAnonymous)
			.run();

		// Update discussion's updated_at timestamp
		const updateStmt = this.env.DB.prepare(`
			UPDATE discussions SET updated_at = datetime('now') WHERE id = ?
		`);
		await updateStmt.bind(discussionId).run();

		// Get the created reply
		const replyStmt = this.env.DB.prepare(`
			SELECT * FROM discussion_replies WHERE id = ?
		`);
		return await replyStmt.bind(id).first();
	}

	// Delete discussion (only by creator or admin)
	async deleteDiscussion(discussionId: string, username: string, isAdmin: boolean) {
		const discussionStmt = this.env.DB.prepare(`
			SELECT creator_username FROM discussions WHERE id = ?
		`);
		const discussion = await discussionStmt.bind(discussionId).first();

		if (!discussion) {
			throw new Error("Discussion not found");
		}

		// Check permissions
		if (!isAdmin && discussion.creator_username !== username) {
			throw new Error("Unauthorized to delete this discussion");
		}

		const stmt = this.env.DB.prepare(`
			DELETE FROM discussions WHERE id = ?
		`);
		await stmt.bind(discussionId).run();

		return { success: true };
	}
}
