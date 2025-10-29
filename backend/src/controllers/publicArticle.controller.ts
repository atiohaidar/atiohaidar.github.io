import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { listArticles, getArticle } from "../services/articles";
import { type AppContext, Article } from "../models/types";

// List Published Articles (Public - No Auth Required)
export class PublicArticleList extends OpenAPIRoute {
  schema = {
    tags: ["Public Articles"],
    summary: "Daftar artikel yang dipublikasikan (publik)",
    request: {
      query: z.object({
        page: Num({
          description: "Nomor halaman",
          required: false,
        })
          .optional()
          .transform((val) => (typeof val === "number" ? val : 0)),
      }),
    },
    responses: {
      "200": {
        description: "Mengembalikan daftar artikel yang dipublikasikan",
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
    const data = await this.getValidatedData<typeof this.schema>();
    const { page } = data.query;

    // Only show published articles for public access
    const articles = await listArticles(c.env.DB, { page, published: true, owner: undefined });
    return c.json({ success: true, articles });
  }
}

// Get Published Article (Public - No Auth Required)
export class PublicArticleGet extends OpenAPIRoute {
  schema = {
    tags: ["Public Articles"],
    summary: "Dapatkan detail artikel yang dipublikasikan (publik)",
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
    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;

    const article = await getArticle(c.env.DB, slug);
    if (!article) {
      return c.json(
        { success: false, message: "Artikel tidak ditemukan" },
        404
      );
    }

    // Only show if article is published
    if (!article.published) {
      return c.json(
        { success: false, message: "Artikel tidak ditemukan" },
        404
      );
    }

    return c.json({ success: true, article });
  }
}
