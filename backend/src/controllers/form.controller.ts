import { OpenAPIRoute, Str, Bool } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Form,
	FormQuestion,
	FormCreateSchema,
	FormUpdateSchema,
	FormResponse,
	FormResponseCreateSchema,
} from "../models/types";
import {
	listForms,
	getForm,
	getFormByToken,
	createForm,
	updateForm,
	deleteForm,
	getFormQuestions,
	submitFormResponse,
	getFormResponses,
	getFormResponseDetail,
} from "../services/forms";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

// List all forms created by authenticated user
export class FormList extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "List all forms created by authenticated user",
		responses: {
			"200": {
				description: "List of forms",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(Form),
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

		const forms = await listForms(c.env.DB, payload.sub);

		return c.json({
			success: true,
			data: forms,
		});
	}
}

// Get a single form by ID (for creator)
export class FormGet extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Get a single form by ID",
		request: {
			params: z.object({
				formId: Str({ example: "form-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Form details with questions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								form: Form,
								questions: z.array(FormQuestion),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - not form owner",
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { formId } = data.params;

		const form = await getForm(c.env.DB, formId);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		if (form.created_by !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		const questions = await getFormQuestions(c.env.DB, formId);

		return c.json({
			success: true,
			data: {
				form,
				questions,
			},
		});
	}
}

// Get a form by token (for respondents)
export class FormGetByToken extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Get a form by token (public access for respondents)",
		request: {
			params: z.object({
				token: Str({ example: "abc123xyz" }),
			}),
		},
		responses: {
			"200": {
				description: "Form details with questions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								form: Form,
								questions: z.array(FormQuestion),
							}),
						}),
					},
				},
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { token } = data.params;

		const form = await getFormByToken(c.env.DB, token);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		const questions = await getFormQuestions(c.env.DB, form.id);

		return c.json({
			success: true,
			data: {
				form,
				questions,
			},
		});
	}
}

// Create a new form
export class FormCreate extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Create a new form",
		request: {
			body: {
				content: {
					"application/json": {
						schema: FormCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Form created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								form: Form,
								questions: z.array(FormQuestion),
							}),
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
		const result = await createForm(c.env.DB, payload.sub, data.body);

		return c.json(
			{
				success: true,
				data: result,
			},
			201,
		);
	}
}

// Update a form
export class FormUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Update a form",
		request: {
			params: z.object({
				formId: Str({ example: "form-001" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: FormUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Form updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								form: Form,
								questions: z.array(FormQuestion),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - not form owner",
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { formId } = data.params;

		const form = await getForm(c.env.DB, formId);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		if (form.created_by !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		const result = await updateForm(c.env.DB, formId, data.body);

		return c.json({
			success: true,
			data: result,
		});
	}
}

// Delete a form
export class FormDelete extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Delete a form",
		request: {
			params: z.object({
				formId: Str({ example: "form-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Form deleted successfully",
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
				description: "Forbidden - not form owner",
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { formId } = data.params;

		const form = await getForm(c.env.DB, formId);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		if (form.created_by !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		await deleteForm(c.env.DB, formId);

		return c.json({
			success: true,
			message: "Form berhasil dihapus",
		});
	}
}

// Submit form response
export class FormResponseSubmit extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Submit a form response (public endpoint)",
		request: {
			params: z.object({
				token: Str({ example: "abc123xyz" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: FormResponseCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Response submitted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: Str(),
						}),
					},
				},
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { token } = data.params;

		const form = await getFormByToken(c.env.DB, token);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		await submitFormResponse(c.env.DB, form.id, data.body);

		return c.json(
			{
				success: true,
				message: "Terima kasih! Jawaban Anda telah berhasil dikirim.",
			},
			201,
		);
	}
}

// Get form responses (for form creator)
export class FormResponseList extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Get all responses for a form",
		request: {
			params: z.object({
				formId: Str({ example: "form-001" }),
			}),
		},
		responses: {
			"200": {
				description: "List of form responses",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.array(FormResponse),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - not form owner",
			},
			"404": {
				description: "Form not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { formId } = data.params;

		const form = await getForm(c.env.DB, formId);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		if (form.created_by !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		const responses = await getFormResponses(c.env.DB, formId);

		return c.json({
			success: true,
			data: responses,
		});
	}
}

// Get a specific form response detail
export class FormResponseGet extends OpenAPIRoute {
	schema = {
		tags: ["Forms"],
		summary: "Get a specific form response with answers",
		request: {
			params: z.object({
				formId: Str({ example: "form-001" }),
				responseId: Str({ example: "resp-001" }),
			}),
		},
		responses: {
			"200": {
				description: "Response details with answers",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								response: FormResponse,
								answers: z.array(z.object({
									question_id: Str(),
									question_text: Str(),
									answer_text: Str(),
								})),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized",
			},
			"403": {
				description: "Forbidden - not form owner",
			},
			"404": {
				description: "Form or response not found",
			},
		},
	};

	async handle(c: AppContext) {
		const payload = getTokenPayloadFromRequest(c);
		if (!payload) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const data = await this.getValidatedData<typeof this.schema>();
		const { formId, responseId } = data.params;

		const form = await getForm(c.env.DB, formId);

		if (!form) {
			return c.json({ success: false, message: "Form tidak ditemukan" }, 404);
		}

		if (form.created_by !== payload.sub) {
			return c.json({ success: false, message: "Akses ditolak" }, 403);
		}

		const responseData = await getFormResponseDetail(c.env.DB, responseId);

		if (!responseData) {
			return c.json({ success: false, message: "Respon tidak ditemukan" }, 404);
		}

		return c.json({
			success: true,
			data: responseData,
		});
	}
}
