import { z } from "zod";
import { 
	Form, 
	FormQuestion, 
	FormCreateSchema, 
	FormUpdateSchema, 
	FormResponse,
	FormResponseCreateSchema,
	FormAnswer,
} from "../models/types";

export type FormRecord = z.infer<typeof Form>;
export type FormQuestionRecord = z.infer<typeof FormQuestion>;
export type FormResponseRecord = z.infer<typeof FormResponse>;
export type FormAnswerRecord = z.infer<typeof FormAnswer>;

const toForm = (row: Record<string, unknown>): FormRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		title: row.title,
		description: row.description ?? undefined,
		token: row.token,
		created_by: row.created_by,
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Form.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data form tidak valid di database");
	}

	return parsed.data;
};

const toFormQuestion = (row: Record<string, unknown>): FormQuestionRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		form_id: row.form_id,
		question_text: row.question_text,
		question_order: row.question_order,
		created_at: row.created_at ?? undefined,
	};

	const parsed = FormQuestion.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data pertanyaan form tidak valid di database");
	}

	return parsed.data;
};

const toFormResponse = (row: Record<string, unknown>): FormResponseRecord => {
	const normalized: Record<string, unknown> = {
		id: row.id,
		form_id: row.form_id,
		respondent_name: row.respondent_name ?? undefined,
		submitted_at: row.submitted_at ?? undefined,
	};

	const parsed = FormResponse.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data respon form tidak valid di database");
	}

	return parsed.data;
};

// Generate a random alphanumeric token
const generateToken = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';
	for (let i = 0; i < 12; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
};

// List forms created by a specific user
export const listForms = async (db: D1Database, username: string) => {
	const { results } = await db
		.prepare(
			"SELECT id, title, description, token, created_by, created_at, updated_at FROM forms WHERE created_by = ? ORDER BY created_at DESC"
		)
		.bind(username)
		.all();

	return (results ?? []).map((row) => toForm(row as Record<string, unknown>));
};

// Get a form by ID
export const getForm = async (db: D1Database, id: string) => {
	const row = await db
		.prepare(
			"SELECT id, title, description, token, created_by, created_at, updated_at FROM forms WHERE id = ?"
		)
		.bind(id)
		.first();

	return row ? toForm(row as Record<string, unknown>) : undefined;
};

// Get a form by token (for respondents)
export const getFormByToken = async (db: D1Database, token: string) => {
	const row = await db
		.prepare(
			"SELECT id, title, description, token, created_by, created_at, updated_at FROM forms WHERE token = ?"
		)
		.bind(token)
		.first();

	return row ? toForm(row as Record<string, unknown>) : undefined;
};

// Get questions for a form
export const getFormQuestions = async (db: D1Database, formId: string) => {
	const { results } = await db
		.prepare(
			"SELECT id, form_id, question_text, question_order, created_at FROM form_questions WHERE form_id = ? ORDER BY question_order"
		)
		.bind(formId)
		.all();

	return (results ?? []).map((row) => toFormQuestion(row as Record<string, unknown>));
};

// Create a new form with questions
export const createForm = async (
	db: D1Database,
	username: string,
	input: z.infer<typeof FormCreateSchema>
) => {
	const data = FormCreateSchema.parse(input);

	// Generate unique IDs and token
	const formId = `form-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
	const token = generateToken();

	// Insert form
	await db
		.prepare(
			"INSERT INTO forms (id, title, description, token, created_by) VALUES (?, ?, ?, ?, ?)"
		)
		.bind(formId, data.title, data.description ?? null, token, username)
		.run();

	// Insert questions
	for (const question of data.questions) {
		const questionId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
		await db
			.prepare(
				"INSERT INTO form_questions (id, form_id, question_text, question_order) VALUES (?, ?, ?, ?)"
			)
			.bind(questionId, formId, question.question_text, question.question_order)
			.run();
	}

	// Retrieve and return the created form with questions
	const form = await getForm(db, formId);
	const questions = await getFormQuestions(db, formId);

	if (!form) {
		throw new Error("Gagal mengambil data form setelah membuat");
	}

	return { form, questions };
};

// Update a form
export const updateForm = async (
	db: D1Database,
	id: string,
	input: z.infer<typeof FormUpdateSchema>
) => {
	const updates = FormUpdateSchema.parse(input);

	// Update form metadata if provided
	const setFragments: string[] = [];
	const values: unknown[] = [];

	if (typeof updates.title === "string") {
		setFragments.push("title = ?");
		values.push(updates.title);
	}

	if (typeof updates.description === "string") {
		setFragments.push("description = ?");
		values.push(updates.description);
	}

	if (setFragments.length > 0) {
		values.push(id);
		const statement = `UPDATE forms SET ${setFragments.join(", ")} WHERE id = ?`;
		await db.prepare(statement).bind(...values).run();
	}

	// Update questions if provided
	if (updates.questions && updates.questions.length > 0) {
		// Delete existing questions
		await db.prepare("DELETE FROM form_questions WHERE form_id = ?").bind(id).run();

		// Insert new questions
		for (const question of updates.questions) {
			const questionId = question.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
			await db
				.prepare(
					"INSERT INTO form_questions (id, form_id, question_text, question_order) VALUES (?, ?, ?, ?)"
				)
				.bind(questionId, id, question.question_text, question.question_order)
				.run();
		}
	}

	// Retrieve and return the updated form with questions
	const form = await getForm(db, id);
	const questions = await getFormQuestions(db, id);

	if (!form) {
		throw new Error("Form tidak ditemukan");
	}

	return { form, questions };
};

// Delete a form
export const deleteForm = async (db: D1Database, id: string) => {
	const existing = await getForm(db, id);
	if (!existing) {
		throw new Error("Form tidak ditemukan");
	}

	await db.prepare("DELETE FROM forms WHERE id = ?").bind(id).run();
	return existing;
};

// Submit a form response
export const submitFormResponse = async (
	db: D1Database,
	formId: string,
	input: z.infer<typeof FormResponseCreateSchema>
) => {
	const data = FormResponseCreateSchema.parse(input);

	// Generate response ID
	const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

	// Insert response
	await db
		.prepare(
			"INSERT INTO form_responses (id, form_id, respondent_name) VALUES (?, ?, ?)"
		)
		.bind(responseId, formId, data.respondent_name ?? null)
		.run();

	// Insert answers
	for (const answer of data.answers) {
		const answerId = `ans-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
		await db
			.prepare(
				"INSERT INTO form_answers (id, response_id, question_id, answer_text) VALUES (?, ?, ?, ?)"
			)
			.bind(answerId, responseId, answer.question_id, answer.answer_text)
			.run();
	}

	return responseId;
};

// Get responses for a form
export const getFormResponses = async (db: D1Database, formId: string) => {
	const { results } = await db
		.prepare(
			"SELECT id, form_id, respondent_name, submitted_at FROM form_responses WHERE form_id = ? ORDER BY submitted_at DESC"
		)
		.bind(formId)
		.all();

	return (results ?? []).map((row) => toFormResponse(row as Record<string, unknown>));
};

// Get a specific response with answers
export const getFormResponseDetail = async (db: D1Database, responseId: string) => {
	// Get response
	const responseRow = await db
		.prepare(
			"SELECT id, form_id, respondent_name, submitted_at FROM form_responses WHERE id = ?"
		)
		.bind(responseId)
		.first();

	if (!responseRow) {
		return undefined;
	}

	const response = toFormResponse(responseRow as Record<string, unknown>);

	// Get answers with question texts
	const { results } = await db
		.prepare(`
			SELECT 
				fa.question_id,
				fq.question_text,
				fa.answer_text
			FROM form_answers fa
			JOIN form_questions fq ON fa.question_id = fq.id
			WHERE fa.response_id = ?
			ORDER BY fq.question_order
		`)
		.bind(responseId)
		.all();

	const answers = (results ?? []).map((row: any) => ({
		question_id: row.question_id,
		question_text: row.question_text,
		answer_text: row.answer_text,
	}));

	return { response, answers };
};
