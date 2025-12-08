import { OpenAPIRoute, Str, Bool, Num } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Event,
	EventCreateSchema,
	EventUpdateSchema,
	EventAttendee,
	EventAttendeeRegisterSchema,
	EventAttendeeUpdateStatusSchema,
	EventAdmin,
	EventAdminAssignSchema,
	AttendanceScan,
	AttendanceScanCreateSchema,
} from "../models/types";
import {
	listEvents,
	getEvent,
	createEvent,
	updateEvent,
	deleteEvent,
	listEventAttendees,
	getEventAttendee,
	registerForEvent,
	updateAttendeeStatus,
	unregisterFromEvent,
	listEventAdmins,
	assignEventAdmin,
	removeEventAdmin,
	isEventAdmin,
	recordAttendanceScan,
	listAttendanceScans,
	getAttendeeWithScans,
	listAllEventScans,
} from "../services/events";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

// List events
export class EventList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List events",
		responses: {
			"200": {
				description: "List of events",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(Event),
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

		const events = await listEvents(c.env.DB);

		return c.json({
			success: true,
			data: events,
		});
	}
}

// Get a single event
export class EventGet extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Get a single event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Event details",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Event,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Event not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId } = data.params;

		const event = await getEvent(c.env.DB, eventId);
		if (!event) {
			return c.json({ success: false, message: "Event not found" }, 404);
		}

		return c.json({
			success: true,
			data: event,
		});
	}
}

// Create an event
export class EventCreate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Create a new event",
		request: {
			body: {
				content: {
					"application/json": {
						schema: EventCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Event created",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Event,
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
		const eventData = data.body as z.infer<typeof EventCreateSchema>;

		const event = await createEvent(c.env.DB, {
			title: eventData.title,
			description: eventData.description,
			event_date: eventData.event_date,
			location: eventData.location,
			created_by: payload.sub,
		});

		return c.json(
			{
				success: true,
				data: event,
			},
			201
		);
	}
}

// Update an event
export class EventUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Update an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: EventUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Event updated",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: Event,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event creator or admin can update",
			},
			"404": {
				description: "Event not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId } = data.params;

		// Check if event exists
		const event = await getEvent(c.env.DB, eventId);
		if (!event) {
			return c.json({ success: false, message: "Event not found" }, 404);
		}

		// Check if user is event creator or admin
		const canEdit =
			event.created_by === payload.sub ||
			payload.role === "admin" ||
			(await isEventAdmin(c.env.DB, eventId, payload.sub));

		if (!canEdit) {
			return c.json({ success: false, message: "Only event creator or admin can update" }, 403);
		}

		const updatedEvent = await updateEvent(c.env.DB, eventId, data.body);

		return c.json({
			success: true,
			data: updatedEvent,
		});
	}
}

// Delete an event
export class EventDelete extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Delete an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Event deleted",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str(),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event creator or admin can delete",
			},
			"404": {
				description: "Event not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId } = data.params;

		// Check if event exists
		const event = await getEvent(c.env.DB, eventId);
		if (!event) {
			return c.json({ success: false, message: "Event not found" }, 404);
		}

		// Check if user is event creator or admin
		const canDelete = event.created_by === payload.sub || payload.role === "admin";

		if (!canDelete) {
			return c.json({ success: false, message: "Only event creator or admin can delete" }, 403);
		}

		await deleteEvent(c.env.DB, eventId);

		return c.json({
			success: true,
			message: "Event deleted successfully",
		});
	}
}

// List event attendees
export class EventAttendeeList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List attendees for an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
		},
		responses: {
			"200": {
				description: "List of attendees",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(EventAttendee),
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
		const { eventId } = data.params;

		const attendees = await listEventAttendees(c.env.DB, eventId);

		return c.json({
			success: true,
			data: attendees,
		});
	}
}

// Register for an event
export class EventAttendeeRegister extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Register for an event",
		request: {
			body: {
				content: {
					"application/json": {
						schema: EventAttendeeRegisterSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Registration successful",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: EventAttendee,
						}),
					},
				},
			},
			"400": {
				description: "Bad request - Already registered",
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
		const { event_id } = data.body;

		try {
			const attendee = await registerForEvent(c.env.DB, event_id, payload.sub);

			return c.json(
				{
					success: true,
					data: attendee,
				},
				201
			);
		} catch (error: any) {
			return c.json({ success: false, message: error.message }, 400);
		}
	}
}

// Update attendee status (manual check-in)
export class EventAttendeeUpdateStatus extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Update attendee status (manual check-in)",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
				attendeeId: Str({ example: "attendee-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: EventAttendeeUpdateStatusSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Status updated",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: EventAttendee,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event admin can update status",
			},
			"404": {
				description: "Attendee not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId, attendeeId } = data.params;

		// Check if user is event admin
		const canUpdate =
			payload.role === "admin" || (await isEventAdmin(c.env.DB, eventId, payload.sub));

		if (!canUpdate) {
			return c.json({ success: false, message: "Only event admin can update status" }, 403);
		}

		const attendee = await getEventAttendee(c.env.DB, attendeeId);
		if (!attendee) {
			return c.json({ success: false, message: "Attendee not found" }, 404);
		}

		const updatedAttendee = await updateAttendeeStatus(c.env.DB, attendeeId, data.body.status);

		return c.json({
			success: true,
			data: updatedAttendee,
		});
	}
}

// Unregister from an event
export class EventAttendeeUnregister extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Unregister from an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
				attendeeId: Str({ example: "attendee-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Unregistered successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str(),
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
				description: "Attendee not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId, attendeeId } = data.params;

		// Check if attendee exists
		const attendee = await getEventAttendee(c.env.DB, attendeeId);
		if (!attendee) {
			return c.json({ success: false, message: "Attendee not found" }, 404);
		}

		// Check if user is the attendee themselves, event admin, or system admin
		const canUnregister =
			attendee.user_username === payload.sub ||
			payload.role === "admin" ||
			(await isEventAdmin(c.env.DB, eventId, payload.sub));

		if (!canUnregister) {
			return c.json({ success: false, message: "Forbidden" }, 403);
		}

		await unregisterFromEvent(c.env.DB, attendeeId);

		return c.json({
			success: true,
			message: "Unregistered successfully",
		});
	}
}

// List event admins
export class EventAdminList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List admins for an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
		},
		responses: {
			"200": {
				description: "List of admins",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(EventAdmin),
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
		const { eventId } = data.params;

		const admins = await listEventAdmins(c.env.DB, eventId);

		return c.json({
			success: true,
			data: admins,
		});
	}
}

// Assign event admin
export class EventAdminAssign extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Assign a user as event admin",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: EventAdminAssignSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Admin assigned",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: EventAdmin,
						}),
					},
				},
			},
			"400": {
				description: "Bad request - Already admin",
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event creator or system admin can assign",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId } = data.params;
		const { user_username } = data.body;

		// Check if event exists
		const event = await getEvent(c.env.DB, eventId);
		if (!event) {
			return c.json({ success: false, message: "Event not found" }, 404);
		}

		// Check if user is event creator or system admin
		const canAssign = event.created_by === payload.sub || payload.role === "admin";

		if (!canAssign) {
			return c.json(
				{ success: false, message: "Only event creator or system admin can assign admins" },
				403
			);
		}

		try {
			const admin = await assignEventAdmin(c.env.DB, eventId, user_username, payload.sub);

			return c.json(
				{
					success: true,
					data: admin,
				},
				201
			);
		} catch (error: any) {
			return c.json({ success: false, message: error.message }, 400);
		}
	}
}

// Remove event admin
export class EventAdminRemove extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Remove an event admin",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
				username: Str({ example: "user1" }),
			}),
		},
		responses: {
			"200": {
				description: "Admin removed",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str(),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event creator or system admin can remove",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId, username } = data.params;

		// Check if event exists
		const event = await getEvent(c.env.DB, eventId);
		if (!event) {
			return c.json({ success: false, message: "Event not found" }, 404);
		}

		// Check if user is event creator or system admin
		const canRemove = event.created_by === payload.sub || payload.role === "admin";

		if (!canRemove) {
			return c.json(
				{ success: false, message: "Only event creator or system admin can remove admins" },
				403
			);
		}

		await removeEventAdmin(c.env.DB, eventId, username);

		return c.json({
			success: true,
			message: "Admin removed successfully",
		});
	}
}

// Scan QR code for attendance
export class AttendanceScanCreate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Scan QR code for attendance",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: AttendanceScanCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Attendance recorded",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								attendee: EventAttendee,
								scan: AttendanceScan,
								isFirstScan: z.boolean(),
							}),
						}),
					},
				},
			},
			"400": {
				description: "Bad request - Invalid token",
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - Only event admin can scan",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { eventId } = data.params;
		const { attendance_token, latitude, longitude } = data.body;

		// Check if user is event admin
		const canScan =
			payload.role === "admin" || (await isEventAdmin(c.env.DB, eventId, payload.sub));

		if (!canScan) {
			return c.json({ success: false, message: "Only event admin can scan attendance" }, 403);
		}

		try {
			const location = latitude && longitude ? { latitude, longitude } : undefined;
			const result = await recordAttendanceScan(c.env.DB, attendance_token, payload.sub, location);

			return c.json(
				{
					success: true,
					data: result,
				},
				201
			);
		} catch (error: any) {
			return c.json({ success: false, message: error.message }, 400);
		}
	}
}

// Get attendee with scan history
export class AttendeeWithScansGet extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Get attendee with scan history",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
				attendeeId: Str({ example: "attendee-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Attendee with scans",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								attendee: EventAttendee,
								scans: z.array(AttendanceScan),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"404": {
				description: "Attendee not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = await getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { attendeeId } = data.params;

		const result = await getAttendeeWithScans(c.env.DB, attendeeId);
		if (!result) {
			return c.json({ success: false, message: "Attendee not found" }, 404);
		}

		return c.json({
			success: true,
			data: result,
		});
	}
}

// Get all scans for an event
export class EventScanHistoryList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Get all scan history for an event",
		request: {
			params: z.object({
				eventId: Str({ example: "event-001" }),
			}),
		},
		responses: {
			"200": {
				description: "List of all scans for the event",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(z.object({
								id: Str(),
								attendee_id: Str(),
								attendee_username: Str(),
								attendee_status: Str(),
								scanned_by: Str(),
								scanned_at: Str(),
								latitude: z.number().optional(),
								longitude: z.number().optional(),
							})),
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
		const { eventId } = data.params;

		const scans = await listAllEventScans(c.env.DB, eventId);

		return c.json({
			success: true,
			data: scans,
		});
	}
}
