import { OpenAPIRoute, Str, Bool } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Item,
	ItemCreateSchema,
	ItemUpdateSchema,
} from "../models/types";
import {
	listItems,
	getItem,
	createItem,
	updateItem,
	deleteItem,
} from "../services/items";
import { ensureAdmin, getTokenPayloadFromRequest } from "../middlewares/auth";

// List items
export class ItemList extends OpenAPIRoute {
	schema = {
		tags: ["Items"],
		summary: "List items (all items or filter by owner)",
		request: {
			query: z.object({
				owner: z.string().optional(),
			}),
		},
		responses: {
			"200": {
				description: "List of items",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(Item),
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
		const { owner } = data.query;

		const items = await listItems(c.env.DB, {
			ownerUsername: owner as string | undefined,
		});

		return c.json({
			success: true,
			data: items,
		});
	}
}

// Get a single item
export class ItemGet extends OpenAPIRoute {
	schema = {
		tags: ["Items"],
		summary: "Get a single item",
		request: {
			params: z.object({
				itemId: Str({ example: "item-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Item details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Item,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Item not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { itemId } = data.params;

		const item = await getItem(c.env.DB, itemId);

		if (!item) {
			return c.json({ success: false, message: "Barang tidak ditemukan" }, 404);
		}

		return c.json({
			success: true,
			data: item,
		});
	}
}

// Create a new item
export class ItemCreate extends OpenAPIRoute {
	schema = {
		tags: ["Items"],
		summary: "Create a new item",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ItemCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Item created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Item,
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
			const item = await createItem(c.env.DB, payload.sub, data.body);
			return c.json(
				{
					success: true,
					data: item,
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

// Update an item
export class ItemUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Items"],
		summary: "Update an item (owner or admin)",
		request: {
			params: z.object({
				itemId: Str({ example: "item-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: ItemUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Item updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Item,
						}),
					},
				},
			},
			"401": { description: "Unauthorized" },
			"403": { description: "Forbidden" },
			"404": { description: "Item not found" },
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { itemId } = data.params;

		try {
			const item = await updateItem(
				c.env.DB,
				itemId,
				payload.sub,
				data.body,
				payload.role as "admin" | "member",
			);
			return c.json({
				success: true,
				data: item,
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

// Delete an item
export class ItemDelete extends OpenAPIRoute {
	schema = {
		tags: ["Items"],
		summary: "Delete an item (owner or admin)",
		request: {
			params: z.object({
				itemId: Str({ example: "item-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Item deleted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Item,
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
				description: "Item not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { itemId } = data.params;

		try {
			const item = await deleteItem(
				c.env.DB,
				itemId,
				payload.sub,
				payload.role as "admin" | "member",
			);
			return c.json({
				success: true,
				data: item,
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
