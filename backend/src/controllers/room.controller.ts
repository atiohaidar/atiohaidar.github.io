import { OpenAPIRoute, Str, Bool } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Room,
	RoomCreateSchema,
	RoomUpdateSchema,
} from "../models/types";
import {
	listRooms,
	getRoom,
	createRoom,
	updateRoom,
	deleteRoom,
} from "../services/rooms";
import { ensureAdmin, getTokenPayloadFromRequest } from "../middlewares/auth";

// List all rooms
export class RoomList extends OpenAPIRoute {
	schema = {
		tags: ["Rooms"],
		summary: "List all rooms",
		request: {
			query: z.object({
				available: z.string().optional().transform((val) => {
    if (val === undefined) return undefined;
    return val === 'true';
  }),
			}),
		},
		responses: {
			"200": {
				description: "List of rooms",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(Room),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { available } = data.query;

		// Debug logging
		console.log('RoomList - available parameter:', available);
		console.log('RoomList - raw query:', c.req.query());
		console.log('RoomList - typeof available:', typeof available);

		// Test database connection
		try {
			const testResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM rooms").first();
			console.log('RoomList - DB test result:', testResult);
		} catch (error) {
			console.error('RoomList - DB connection error:', error);
		}

		const rooms = await listRooms(c.env.DB, { available: available as boolean | undefined });

		return c.json({
			success: true,
			data: rooms,
		});
	}
}

// Get a single room
export class RoomGet extends OpenAPIRoute {
	schema = {
		tags: ["Rooms"],
		summary: "Get a single room",
		request: {
			params: z.object({
				roomId: Str({ example: "room-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Room details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Room,
						}),
					},
				},
			},
			"404": {
				description: "Room not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { roomId } = data.params;

		const room = await getRoom(c.env.DB, roomId);

		if (!room) {
			return c.json({ success: false, message: "Ruangan tidak ditemukan" }, 404);
		}

		return c.json({
			success: true,
			data: room,
		});
	}
}

// Create a new room (admin only)
export class RoomCreate extends OpenAPIRoute {
	schema = {
		tags: ["Rooms"],
		summary: "Create a new room (admin only)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: RoomCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Room created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Room,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - admin only",
			},
		},
	};

	async handle(c: AppContext) {
		const admin = ensureAdmin(c);
		if (!admin) {
			return c.json({ success: false, message: "Akses ditolak, hanya admin" }, 403);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const room = await createRoom(c.env.DB, data.body);

		return c.json(
			{
				success: true,
				data: room,
			},
			201,
		);
	}
}

// Update a room (admin only)
export class RoomUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Rooms"],
		summary: "Update a room (admin only)",
		request: {
			params: z.object({
				roomId: Str({ example: "room-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: RoomUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Room updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Room,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - admin only",
			},
			"404": {
				description: "Room not found",
			},
		},
	};

	async handle(c: AppContext) {
		const admin = ensureAdmin(c);
		if (!admin) {
			return c.json({ success: false, message: "Akses ditolak, hanya admin" }, 403);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { roomId } = data.params;

		try {
			const room = await updateRoom(c.env.DB, roomId, data.body);
			return c.json({
				success: true,
				data: room,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("tidak ditemukan")) {
				return c.json({ success: false, message: error.message }, 404);
			}
			throw error;
		}
	}
}

// Delete a room (admin only)
export class RoomDelete extends OpenAPIRoute {
	schema = {
		tags: ["Rooms"],
		summary: "Delete a room (admin only)",
		request: {
			params: z.object({
				roomId: Str({ example: "room-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Room deleted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Room,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - admin only",
			},
			"404": {
				description: "Room not found",
			},
		},
	};

	async handle(c: AppContext) {
		const admin = ensureAdmin(c);
		if (!admin) {
			return c.json({ success: false, message: "Akses ditolak, hanya admin" }, 403);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { roomId } = data.params;

		try {
			const room = await deleteRoom(c.env.DB, roomId);
			return c.json({
				success: true,
				data: room,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("tidak ditemukan")) {
				return c.json({ success: false, message: error.message }, 404);
			}
			throw error;
		}
	}
}
