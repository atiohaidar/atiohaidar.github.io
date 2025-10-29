import { Bool, DateTime, Num, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type Bindings = {
	DB: D1Database;
};

export type AppContext = Context<{ Bindings: Bindings }>;

export const Task = z.object({
	id: Num({ description: "Auto-incrementing identifier", example: 1 }),
	name: Str({ example: "Clean my room" }),
	description: Str({ required: false, example: "Tidy up before guests come" }),
	completed: Bool({ default: false }),
	due_date: Str({ required: false }),
	owner: Str({ required: false, description: "Username of task owner" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const TaskCreateSchema = z.object({
	name: Str({ example: "Clean my room" }),
	description: Str({ required: false }),
	completed: Bool({ default: false }),
	due_date: Str({ required: false }),
});

export const TaskUpdateSchema = z
	.object({
		name: Str({ required: false }),
		description: Str({ required: false }),
		completed: Bool({ required: false }),
		due_date: Str({ required: false }),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Minimal satu field harus diisi",
	});

export const Article = z.object({
	slug: Str({ description: "Unique identifier", example: "introduction-to-astro" }),
	title: Str({ example: "Introduction to Astro" }),
	content: Str({ example: "Konten lengkap artikel" }),
	published: Bool({ default: false }),
	owner: Str({ required: false, description: "Username of article owner" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const ArticleCreateSchema = z.object({
	slug: Str({ example: "introduction-to-astro" }),
	title: Str({ example: "Introduction to Astro" }),
	content: Str({ example: "Konten lengkap artikel" }),
	published: Bool({ default: false }),
});

export const ArticleUpdateSchema = z
	.object({
		title: Str({ required: false }),
		content: Str({ required: false }),
		published: Bool({ required: false }),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Minimal satu field harus diisi",
	});

export const UserRoleSchema = z.enum(["admin", "member"], {
	description: "Role pengguna yang menentukan hak akses",
});

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserPublicSchema = z.object({
	username: Str({ example: "admin" }),
	name: Str({ example: "Administrator" }),
	role: UserRoleSchema,
});

export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserCreateSchema = z.object({
	username: Str({ example: "newuser" }),
	name: Str({ example: "New User" }),
	password: Str({ example: "supersecret" }),
	role: UserRoleSchema.default("member"),
});

export const UserUpdateSchema = z
	.object({
		name: Str({ required: false }),
		password: Str({ required: false }),
		role: UserRoleSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Minimal satu field harus diisi",
	});

// Room schemas
export const Room = z.object({
	id: Str({ description: "Unique identifier", example: "room-001" }),
	name: Str({ example: "Meeting Room A" }),
	capacity: z.number({ description: "Room capacity" }),
	description: Str({ required: false, example: "Ruang meeting dengan proyektor" }),
	available: Bool({ default: true }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const RoomCreateSchema = z.object({
	name: Str({ example: "Meeting Room A" }),
	capacity: z.number().int().positive(),
	description: Str({ required: false }),
	available: Bool({ default: true }),
});

export const RoomUpdateSchema = z
	.object({
		name: Str({ required: false }),
		capacity: z.number().int().positive().optional(),
		description: Str({ required: false }),
		available: Bool({ required: false }),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Minimal satu field harus diisi",
	});

// Booking schemas
export const BookingStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"], {
	description: "Status peminjaman ruangan",
});

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const Booking = z.object({
	id: Str({ description: "Unique identifier", example: "booking-001" }),
	room_id: Str({ example: "room-001" }),
	user_username: Str({ example: "user" }),
	start_time: Str({ description: "ISO 8601 datetime", example: "2024-01-15T09:00:00Z" }),
	end_time: Str({ description: "ISO 8601 datetime", example: "2024-01-15T11:00:00Z" }),
	status: BookingStatusSchema.default("pending"),
	title: Str({ example: "Team Meeting" }),
	description: Str({ required: false }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const BookingCreateSchema = z.object({
	room_id: Str({ example: "room-001" }),
	title: Str({ example: "Team Meeting" }),
	description: Str({ required: false }),
	start_time: Str({ description: "ISO 8601 datetime" }),
	end_time: Str({ description: "ISO 8601 datetime" }),
});

export const BookingUpdateSchema = z.object({
	status: BookingStatusSchema,
});

// Chat schemas
export const Message = z.object({
	id: Str({ description: "Unique identifier", example: "msg-001" }),
	conversation_id: Str({ required: false }),
	group_id: Str({ required: false }),
	sender_username: Str({ example: "user" }),
	content: Str({ example: "Hello there!" }),
	reply_to_id: Str({ required: false }),
	created_at: Str({ required: false }),
});

export const MessageCreateSchema = z.object({
	conversation_id: Str({ required: false }),
	group_id: Str({ required: false }),
	content: Str({ example: "Hello there!" }),
	reply_to_id: Str({ required: false }),
});

export const Conversation = z.object({
	id: Str({ description: "Unique identifier", example: "conv-001" }),
	user1_username: Str({ example: "user1" }),
	user2_username: Str({ example: "user2" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const GroupChat = z.object({
	id: Str({ description: "Unique identifier", example: "group-001" }),
	name: Str({ example: "Team Chat" }),
	description: Str({ required: false }),
	created_by: Str({ example: "admin" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const GroupChatCreateSchema = z.object({
	name: Str({ example: "Team Chat" }),
	description: Str({ required: false }),
});

export const GroupChatUpdateSchema = z
	.object({
		name: Str({ required: false }),
		description: Str({ required: false }),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Minimal satu field harus diisi",
	});

export const GroupMemberRoleSchema = z.enum(["admin", "member"], {
	description: "Role anggota grup",
});

export type GroupMemberRole = z.infer<typeof GroupMemberRoleSchema>;

export const GroupMember = z.object({
	group_id: Str({ example: "group-001" }),
	user_username: Str({ example: "user" }),
	role: GroupMemberRoleSchema.default("member"),
	joined_at: Str({ required: false }),
});

export const GroupMemberAddSchema = z.object({
	user_username: Str({ example: "user" }),
	role: GroupMemberRoleSchema.default("member"),
});

export const AnonymousMessage = z.object({
	id: Str({ description: "Unique identifier", example: "anon-001" }),
	sender_id: Str({ description: "Anonymous sender identifier" }),
	content: Str({ example: "Hello anonymously!" }),
	reply_to_id: Str({ required: false }),
	created_at: Str({ required: false }),
});

export const AnonymousMessageCreateSchema = z.object({
	sender_id: Str({ description: "Anonymous sender identifier" }),
	content: Str({ example: "Hello anonymously!" }),
	reply_to_id: Str({ required: false }),
});

// Form schemas
export const FormQuestion = z.object({
	id: Str({ description: "Unique identifier", example: "q-001" }),
	form_id: Str({ example: "form-001" }),
	question_text: Str({ example: "What is your name?" }),
	question_order: z.number().int().positive(),
	created_at: Str({ required: false }),
});

export const Form = z.object({
	id: Str({ description: "Unique identifier", example: "form-001" }),
	title: Str({ example: "Customer Feedback Form" }),
	description: Str({ required: false, example: "Tell us about your experience" }),
	token: Str({ description: "Access token for respondents" }),
	created_by: Str({ example: "admin" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const FormCreateSchema = z.object({
	title: Str({ example: "Customer Feedback Form" }),
	description: Str({ required: false }),
	questions: z.array(z.object({
		question_text: Str({ example: "What is your name?" }),
		question_order: z.number().int().positive(),
	})),
});

export const FormUpdateSchema = z.object({
	title: Str({ required: false }),
	description: Str({ required: false }),
	questions: z.array(z.object({
		id: Str({ required: false }),
		question_text: Str({ example: "What is your name?" }),
		question_order: z.number().int().positive(),
	})).optional(),
});

export const FormResponse = z.object({
	id: Str({ description: "Unique identifier", example: "resp-001" }),
	form_id: Str({ example: "form-001" }),
	respondent_name: Str({ required: false, example: "John Doe" }),
	submitted_at: Str({ required: false }),
});

export const FormAnswer = z.object({
	id: Str({ description: "Unique identifier", example: "ans-001" }),
	response_id: Str({ example: "resp-001" }),
	question_id: Str({ example: "q-001" }),
	answer_text: Str({ example: "John Doe" }),
	created_at: Str({ required: false }),
});

export const FormResponseCreateSchema = z.object({
	respondent_name: Str({ required: false }),
	answers: z.array(z.object({
		question_id: Str({ example: "q-001" }),
		answer_text: Str({ example: "My answer" }),
	})),
});

// Ticket schemas
export const TicketCategory = z.object({
	id: Num({ description: "Category ID", example: 1 }),
	name: Str({ example: "Technical" }),
	description: Str({ required: false, example: "Technical issues and bugs" }),
	created_at: Str({ required: false }),
});

export const Ticket = z.object({
	id: Num({ description: "Ticket ID", example: 1 }),
	token: Str({ description: "Access token for tracking", example: "TKT-ABC123" }),
	title: Str({ example: "Cannot login to dashboard" }),
	description: Str({ example: "Detailed description of the issue" }),
	category_id: Num({ example: 1 }),
	status: z.enum(["open", "in_progress", "waiting", "solved"]),
	priority: z.enum(["low", "medium", "high", "critical"]),
	submitter_name: Str({ required: false, example: "John Doe" }),
	submitter_email: Str({ required: false, example: "john@example.com" }),
	reference_link: Str({ required: false, example: "https://example.com/screenshot" }),
	assigned_to: Str({ required: false, example: "admin" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const TicketCreateSchema = z.object({
	title: Str({ example: "Cannot login to dashboard" }),
	description: Str({ example: "Detailed description of the issue" }),
	category_id: Num({ example: 1 }),
	priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
	submitter_name: Str({ required: false, example: "John Doe" }),
	submitter_email: Str({ required: false, example: "john@example.com" }),
	reference_link: Str({ required: false, example: "https://example.com/screenshot" }),
});

export const TicketUpdateSchema = z.object({
	title: Str({ required: false }),
	description: Str({ required: false }),
	category_id: Num({ required: false }),
	status: z.enum(["open", "in_progress", "waiting", "solved"]).optional(),
	priority: z.enum(["low", "medium", "high", "critical"]).optional(),
	assigned_to: Str({ required: false }),
}).refine((data) => Object.keys(data).length > 0, {
	message: "Minimal satu field harus diisi",
});

export const TicketComment = z.object({
	id: Num({ description: "Comment ID", example: 1 }),
	ticket_id: Num({ example: 1 }),
	commenter_type: z.enum(["guest", "user"]),
	commenter_name: Str({ example: "John Doe" }),
	comment_text: Str({ example: "This is a comment" }),
	is_internal: Bool({ default: false }),
	created_at: Str({ required: false }),
});

export const TicketCommentCreateSchema = z.object({
	comment_text: Str({ example: "This is a comment" }),
	is_internal: Bool({ default: false }),
});

export const TicketAssignment = z.object({
	id: Num({ description: "Assignment ID", example: 1 }),
	ticket_id: Num({ example: 1 }),
	assigned_from: Str({ required: false, example: "admin" }),
	assigned_to: Str({ example: "user1" }),
	assigned_by: Str({ example: "admin" }),
	notes: Str({ required: false, example: "Assigning to specialist" }),
	created_at: Str({ required: false }),
});

export const TicketAssignSchema = z.object({
	assigned_to: Str({ example: "user1" }),
	notes: Str({ required: false, example: "Assigning to specialist" }),
});
