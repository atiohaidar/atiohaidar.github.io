import { OpenAPIRoute, Str, Bool } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Booking,
	BookingCreateSchema,
	BookingUpdateSchema,
	BookingStatusSchema,
} from "../models/types";
import {
	listBookings,
	getBooking,
	createBooking,
	updateBookingStatus,
	cancelBooking,
} from "../services/bookings";
import { ensureAdmin, getTokenPayloadFromRequest } from "../middlewares/auth";

// List bookings
export class BookingList extends OpenAPIRoute {
	schema = {
		tags: ["Bookings"],
		summary: "List bookings (all for admin, own for members)",
		request: {
			query: z.object({
				roomId: z.string().optional(),
				status: z.string().optional(),
			}),
		},
		responses: {
			"200": {
				description: "List of bookings",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(Booking),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { roomId, status } = data.query;

		// Admin can see all bookings, members can only see their own
		const username = payload.role === "admin" ? undefined : payload.sub;

		const bookings = await listBookings(c.env.DB, { 
			username, 
			roomId: roomId as string | undefined, 
			status: status as any
		});

		return c.json({
			success: true,
			data: bookings,
		});
	}
}

// Get a single booking
export class BookingGet extends OpenAPIRoute {
	schema = {
		tags: ["Bookings"],
		summary: "Get a single booking",
		request: {
			params: z.object({
				bookingId: Str({ example: "booking-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Booking details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Booking,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden",
			},
			"404": {
				description: "Booking not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { bookingId } = data.params;

		const booking = await getBooking(c.env.DB, bookingId);

		if (!booking) {
			return c.json({ success: false, message: "Peminjaman tidak ditemukan" }, 404);
		}

		// Check authorization: admin can see all, members can only see their own
		if (payload.role !== "admin" && booking.user_username !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		return c.json({
			success: true,
			data: booking,
		});
	}
}

// Create a new booking
export class BookingCreate extends OpenAPIRoute {
	schema = {
		tags: ["Bookings"],
		summary: "Create a new booking",
		request: {
			body: {
				content: {
					"application/json": {
						schema: BookingCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Booking created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Booking,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"400": {
				description: "Bad request - validation error",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();

		try {
			const booking = await createBooking(c.env.DB, payload.sub, data.body);
			return c.json(
				{
					success: true,
					data: booking,
				},
				201,
			);
		} catch (error) {
			if (error instanceof Error) {
				return c.json({ success: false, message: error.message }, 400);
			}
			throw error;
		}
	}
}

// Update booking status (admin only)
export class BookingUpdateStatus extends OpenAPIRoute {
	schema = {
		tags: ["Bookings"],
		summary: "Update booking status (admin only)",
		request: {
			params: z.object({
				bookingId: Str({ example: "booking-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: BookingUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Booking updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Booking,
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
				description: "Booking not found",
			},
		},
	};

	async handle(c: AppContext) {
		const admin = ensureAdmin(c);
		if (!admin) {
			return c.json({ success: false, message: "Akses ditolak, hanya admin" }, 403);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { bookingId } = data.params;

		try {
			const booking = await updateBookingStatus(c.env.DB, bookingId, data.body);
			return c.json({
				success: true,
				data: booking,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("tidak ditemukan")) {
				return c.json({ success: false, message: error.message }, 404);
			}
			throw error;
		}
	}
}

// Cancel a booking (owner or admin)
export class BookingCancel extends OpenAPIRoute {
	schema = {
		tags: ["Bookings"],
		summary: "Cancel a booking (owner or admin)",
		request: {
			params: z.object({
				bookingId: Str({ example: "booking-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Booking cancelled successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Booking,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden",
			},
			"404": {
				description: "Booking not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { bookingId } = data.params;

		try {
			// Admin can cancel any booking, members can only cancel their own
			if (payload.role === "admin") {
				const booking = await getBooking(c.env.DB, bookingId);
				if (!booking) {
					return c.json({ success: false, message: "Peminjaman tidak ditemukan" }, 404);
				}
				const updated = await updateBookingStatus(c.env.DB, bookingId, { status: "cancelled" });
				return c.json({
					success: true,
					data: updated,
				});
			} else {
				const booking = await cancelBooking(c.env.DB, bookingId, payload.sub);
				return c.json({
					success: true,
					data: booking,
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("tidak ditemukan")) {
					return c.json({ success: false, message: error.message }, 404);
				}
				if (error.message.includes("tidak memiliki izin")) {
					return c.json({ success: false, message: error.message }, 403);
				}
				return c.json({ success: false, message: error.message }, 400);
			}
			throw error;
		}
	}
}
