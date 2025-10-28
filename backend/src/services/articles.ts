import { z } from "zod";
import { Article, ArticleCreateSchema, ArticleUpdateSchema } from "../models/types";

export type ArticleRecord = z.infer<typeof Article>;

let initializedPromise: Promise<void> | undefined;

const ensureInitialized = async (db: D1Database) => {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			await db.batch([
				db.prepare(`
					CREATE TABLE IF NOT EXISTS articles (
						slug TEXT PRIMARY KEY,
						title TEXT NOT NULL,
						content TEXT NOT NULL,
						published INTEGER NOT NULL DEFAULT 0,
						created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						updated_at TEXT DEFAULT CURRENT_TIMESTAMP
					)
				`),
				db.prepare(`
					CREATE TRIGGER IF NOT EXISTS articles_updated_at
					AFTER UPDATE ON articles
					FOR EACH ROW
					BEGIN
						UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE slug = OLD.slug;
					END
				`),
			]);
		})();
	}

	await initializedPromise;
};

const toArticle = (row: Record<string, unknown>): ArticleRecord => {
	const normalized: Record<string, unknown> = {
		slug: row.slug,
		title: row.title,
		content: row.content,
		published: Boolean(row.published),
		created_at: row.created_at ?? undefined,
		updated_at: row.updated_at ?? undefined,
	};

	const parsed = Article.safeParse(normalized);
	if (!parsed.success) {
		throw new Error("Data artikel tidak valid di database");
	}

	return parsed.data;
};

export const listArticles = async (
	db: D1Database,
	options: { page: number; published?: boolean | undefined },
) => {
	await ensureInitialized(db);

	const { page, published } = options;
	const pageSize = 20;
	const offset = Math.max(page, 0) * pageSize;

	let query = "SELECT slug, title, content, published, created_at, updated_at FROM articles";
	const bindings: unknown[] = [];

	if (typeof published === "boolean") {
		query += " WHERE published = ?";
		bindings.push(published ? 1 : 0);
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
	bindings.push(pageSize, offset);

	const { results } = await db.prepare(query).bind(...bindings).all();

	return (results ?? []).map((row) => toArticle(row as Record<string, unknown>));
};

export const getArticle = async (db: D1Database, slug: string) => {
	await ensureInitialized(db);
	const row = await db
		.prepare(
			"SELECT slug, title, content, published, created_at, updated_at FROM articles WHERE slug = ?",
		)
		.bind(slug)
		.first();

	return row ? toArticle(row as Record<string, unknown>) : undefined;
};

export const createArticle = async (
	db: D1Database,
	input: z.infer<typeof ArticleCreateSchema>,
) => {
	await ensureInitialized(db);
	const data = ArticleCreateSchema.parse(input);

	try {
		await db
			.prepare(
				"INSERT INTO articles (slug, title, content, published) VALUES (?, ?, ?, ?)",
			)
			.bind(data.slug, data.title, data.content, data.published ? 1 : 0)
			.run();
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new Error("Slug artikel sudah digunakan");
		}

		throw error;
	}

	const article = await getArticle(db, data.slug);
	if (!article) {
		throw new Error("Gagal mengambil artikel setelah membuat data");
	}

	return article;
};

export const updateArticle = async (
	db: D1Database,
	slug: string,
	input: z.infer<typeof ArticleUpdateSchema>,
) => {
	await ensureInitialized(db);
	const updates = ArticleUpdateSchema.parse(input);

	const setFragments: string[] = [];
	const values: unknown[] = [];

	if (typeof updates.title === "string") {
		setFragments.push("title = ?");
		values.push(updates.title);
	}

	if (typeof updates.content === "string") {
		setFragments.push("content = ?");
		values.push(updates.content);
	}

	if (typeof updates.published === "boolean") {
		setFragments.push("published = ?");
		values.push(updates.published ? 1 : 0);
	}

	if (setFragments.length === 0) {
		throw new Error("Minimal satu field harus diisi");
	}

	values.push(slug);
	const statement = `UPDATE articles SET ${setFragments.join(", ")} WHERE slug = ?`;
	const result = await db.prepare(statement).bind(...values).run();

	if ((result.meta?.changes ?? 0) === 0) {
		throw new Error("Artikel tidak ditemukan");
	}

	const article = await getArticle(db, slug);
	if (!article) {
		throw new Error("Gagal mengambil artikel setelah pembaruan");
	}

	return article;
};

export const deleteArticle = async (db: D1Database, slug: string) => {
	await ensureInitialized(db);
	const existing = await getArticle(db, slug);
	if (!existing) {
		throw new Error("Artikel tidak ditemukan");
	}

	await db.prepare("DELETE FROM articles WHERE slug = ?").bind(slug).run();
	return existing;
};
