import { OpenAPIRoute, Str, Bool } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	ItemBorrowing,
	ItemBorrowingCreateSchema,
	ItemBorrowingUpdateStatusSchema,
} from "../models/types";
import {
	listItemBorrowings,
	getItemBorrowing,
	createItemBorrowing,
	updateItemBorrowingStatus,
	cancelItemBorrowing,
} from "../services/itemBorrowings";
import { getItem } from "../services/items";
import { ensureAdmin, getTokenPayloadFromRequest } from "../middlewares/auth";

// List borrowings
export class ItemBorrowingList extends OpenAPIRoute {
	schema = {
		tags: ["Item Borrowings"],
		summary: "List item borrowings (all for admin, own + owned items for members)",
		request: {
			query: z.object({
				itemId: z.string().optional(),
				status: z.string().optional(),
			}),
		},
		responses: {
			"200": {
				description: "List of item borrowings",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(ItemBorrowing),
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
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { itemId, status } = data.query;

		let borrowings: any[] = [];

		if (payload.role === "admin") {
			// Admin can see all borrowings
			borrowings = await listItemBorrowings(c.env.DB, {
				itemId: itemId as string | undefined,
				status: status as any,
			});
		} else {
			// Members see their own borrowing requests and borrowings for items they own
			const asBorrower = await listItemBorrowings(c.env.DB, {
				borrowerUsername: payload.sub,
				itemId: itemId as string | undefined,
				status: status as any,
			});

			const asOwner = await listItemBorrowings(c.env.DB, {
				ownerUsername: payload.sub,
				itemId: itemId as string | undefined,
				status: status as any,
			});

			// Combine and deduplicate
			const borrowingMap = new Map();
			[...asBorrower, ...asOwner].forEach((b) => borrowingMap.set(b.id, b));
			borrowings = Array.from(borrowingMap.values());
		}

		return c.json({
			success: true,
			data: borrowings,
		});
	}
}

// Get a single borrowing
export class ItemBorrowingGet extends OpenAPIRoute {
	schema = {
		tags: ["Item Borrowings"],
		summary: "Get a single item borrowing",
		request: {
			params: z.object({
				borrowingId: Str({ example: "borrow-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Borrowing details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: ItemBorrowing,
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
				description: "Borrowing not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { borrowingId } = data.params;

		const borrowing = await getItemBorrowing(c.env.DB, borrowingId);

		if (!borrowing) {
			return c.json({ success: false, message: "Peminjaman tidak ditemukan" }, 404);
		}

		// Check authorization: admin, borrower, or item owner can see
		if (payload.role !== "admin" && borrowing.borrower_username !== payload.sub) {
			const item = await getItem(c.env.DB, borrowing.item_id);
			if (!item || item.owner_username !== payload.sub) {
				return c.json({ success: false, message: "Akses ditolak" }, 403);
			}
		}

		return c.json({
			success: true,
			data: borrowing,
		});
	}
}

// Create a new borrowing request
export class ItemBorrowingCreate extends OpenAPIRoute {
	schema = {
		tags: ["Item Borrowings"],
		summary: "Create a new item borrowing request",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ItemBorrowingCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Borrowing created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: ItemBorrowing,
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
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();

		try {
			const borrowing = await createItemBorrowing(c.env.DB, payload.sub, data.body);
			return c.json(
				{
					success: true,
					data: borrowing,
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

// Update borrowing status (item owner or admin)
export class ItemBorrowingUpdateStatus extends OpenAPIRoute {
	schema = {
		tags: ["Item Borrowings"],
		summary: "Update borrowing status (item owner or admin)",
		request: {
			params: z.object({
				borrowingId: Str({ example: "borrow-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: ItemBorrowingUpdateStatusSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Borrowing updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: ItemBorrowing,
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
				description: "Borrowing not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { borrowingId } = data.params;

		try {
			const borrowing = await updateItemBorrowingStatus(
				c.env.DB,
				borrowingId,
				payload.sub,
				data.body,
				payload.role as "admin" | "member",
			);
			return c.json({
				success: true,
				data: borrowing,
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("tidak ditemukan")) {
					return c.json({ success: false, message: error.message }, 404);
				}
				if (error.message.includes("tidak dapat memperbarui")) {
					return c.json({ success: false, message: error.message }, 403);
				}
				return c.json({ success: false, message: error.message }, 400);
			}
			throw error;
		}
	}
}

// Cancel a borrowing (borrower)
export class ItemBorrowingCancel extends OpenAPIRoute {
	schema = {
		tags: ["Item Borrowings"],
		summary: "Cancel a borrowing request (borrower)",
		request: {
			params: z.object({
				borrowingId: Str({ example: "borrow-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Borrowing cancelled successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: ItemBorrowing,
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
				description: "Borrowing not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { borrowingId } = data.params;

		try {
			const borrowing = await cancelItemBorrowing(c.env.DB, borrowingId, payload.sub);
			return c.json({
				success: true,
				data: borrowing,
			});
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
