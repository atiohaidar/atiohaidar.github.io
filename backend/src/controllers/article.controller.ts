import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { 
  createArticle, 
  getArticle, 
  updateArticle, 
  deleteArticle, 
  listArticles 
} from "../services/articles";
import { ensureAdmin, getTokenPayloadFromRequest } from "../middlewares/auth";
import { 
  type AppContext, 
  Article, 
  ArticleCreateSchema, 
  ArticleUpdateSchema 
} from "../models/types";

// List Articles
export class ArticleList extends OpenAPIRoute {
  schema = {
    tags: ["Articles"],
    summary: "Daftar artikel",
    request: {
      query: z.object({
        page: Num({
          description: "Nomor halaman",
          required: false,
        })
          .optional()
          .transform((val) => (typeof val === "number" ? val : 0)),
        published: Bool({
          description: "Filter berdasarkan status publikasi",
          required: false,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Mengembalikan daftar artikel",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              articles: Article.array(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await this.getValidatedData<typeof this.schema>();
    const { page, published } = data.query;

    // Admin can see all articles, members can only see their own
    const owner = payload.role === "admin" ? undefined : payload.sub;

    const articles = await listArticles(c.env.DB, { page, published, owner });
    return c.json({ success: true, articles });
  }
}

// Get Article
export class ArticleGet extends OpenAPIRoute {
  schema = {
    tags: ["Articles"],
    summary: "Dapatkan detail artikel",
    request: {
      params: z.object({
        slug: Str({ description: "Slug artikel" }),
      }),
    },
    responses: {
      "200": {
        description: "Detail artikel",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              article: Article,
            }),
          },
        },
      },
      "404": {
        description: "Artikel tidak ditemukan",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;

    const article = await getArticle(c.env.DB, slug);
    if (!article) {
      return c.json(
        { success: false, message: "Artikel tidak ditemukan" },
        404
      );
    }

    // Check authorization: admin can see all, members can only see their own
    if (payload.role !== "admin" && article.owner !== payload.sub) {
      return c.json(
        { success: false, message: "Akses ditolak" },
        403
      );
    }

    return c.json({ success: true, article });
  }
}

// Create Article
export class ArticleCreate extends OpenAPIRoute {
  schema = {
    tags: ["Articles"],
    summary: "Buat artikel baru",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ArticleCreateSchema,
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Artikel berhasil dibuat",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              article: Article,
            }),
          },
        },
      },
      "400": {
        description: "Validasi gagal",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
      "403": {
        description: "Tidak memiliki hak akses",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const article = await createArticle(c.env.DB, data.body, payload.sub);
      return c.json({ success: true, article }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat artikel";
      return c.json({ success: false, message }, 400);
    }
  }
}

// Update Article
export class ArticleUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Articles"],
    summary: "Perbarui artikel",
    request: {
      params: z.object({
        slug: Str({ description: "Slug artikel" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: ArticleUpdateSchema,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Artikel berhasil diperbarui",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              article: Article,
            }),
          },
        },
      },
      "400": {
        description: "Validasi gagal",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
      "403": {
        description: "Tidak memiliki hak akses",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
      "404": {
        description: "Artikel tidak ditemukan",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const { slug } = data.params;
      
      // Check if article exists and belongs to user
      const existingArticle = await getArticle(c.env.DB, slug);
      if (!existingArticle) {
        return c.json({ success: false, message: "Artikel tidak ditemukan" }, 404);
      }

      // Check authorization: admin can update all, members can only update their own
      if (payload.role !== "admin" && existingArticle.owner !== payload.sub) {
        return c.json({ success: false, message: "Akses ditolak" }, 403);
      }
      
      const article = await updateArticle(c.env.DB, slug, data.body);
      return c.json({ success: true, article });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui artikel";
      const status = message.includes("tidak ditemukan") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }
}

// Delete Article
export class ArticleDelete extends OpenAPIRoute {
  schema = {
    tags: ["Articles"],
    summary: "Hapus artikel",
    request: {
      params: z.object({
        slug: Str({ description: "Slug artikel" }),
      }),
    },
    responses: {
      "200": {
        description: "Artikel berhasil dihapus",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              article: Article,
            }),
          },
        },
      },
      "403": {
        description: "Tidak memiliki hak akses",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
      "404": {
        description: "Artikel tidak ditemukan",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const { slug } = data.params;
      
      // Check if article exists and belongs to user
      const existingArticle = await getArticle(c.env.DB, slug);
      if (!existingArticle) {
        return c.json({ success: false, message: "Artikel tidak ditemukan" }, 404);
      }

      // Check authorization: admin can delete all, members can only delete their own
      if (payload.role !== "admin" && existingArticle.owner !== payload.sub) {
        return c.json({ success: false, message: "Akses ditolak" }, 403);
      }
      
      const article = await deleteArticle(c.env.DB, slug);
      return c.json({ success: true, article });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus artikel";
      const status = message.includes("tidak ditemukan") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }
}
