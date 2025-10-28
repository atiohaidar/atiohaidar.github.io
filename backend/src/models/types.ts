import { Bool, DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type Bindings = {
	DB: D1Database;
};

export type AppContext = Context<{ Bindings: Bindings }>;

export const Task = z.object({
	slug: Str({ description: "Unique identifier", example: "clean-room" }),
	name: Str({ example: "Clean my room" }),
	description: Str({ required: false, example: "Tidy up before guests come" }),
	completed: Bool({ default: false }),
	due_date: Str({ required: false }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const TaskCreateSchema = z.object({
	slug: Str({ example: "clean-room" }),
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
	id: Str({ example: "room-001" }),
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
	purpose: Str({ required: false, example: "Team meeting" }),
	created_at: Str({ required: false }),
	updated_at: Str({ required: false }),
});

export const BookingCreateSchema = z.object({
	room_id: Str({ example: "room-001" }),
	start_time: Str({ description: "ISO 8601 datetime" }),
	end_time: Str({ description: "ISO 8601 datetime" }),
	purpose: Str({ required: false }),
});

export const BookingUpdateSchema = z.object({
	status: BookingStatusSchema,
});
