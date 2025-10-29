import { Bool, Str } from "chanfana";
import { z } from "zod";
import { 
  listUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from "../services/users";
import { ensureAdmin } from "../middlewares/auth";
import { type AppContext, UserPublicSchema, UserCreateSchema, UserUpdateSchema } from "../models/types";

export class UserController {
  // Schema definitions
  static listSchema = {
    tags: ["Users"],
    summary: "Dapatkan daftar seluruh pengguna",
    responses: {
      "200": {
        description: "Daftar pengguna tersedia",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              users: UserPublicSchema.array(),
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
              message: Str({ example: "Hak akses admin diperlukan" }),
            }),
          },
        },
      },
    },
  };

  static getSchema = {
    tags: ["Users"],
    summary: "Dapatkan detail pengguna",
    request: {
      params: z.object({
        username: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Detail pengguna tersedia",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: UserPublicSchema,
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
        description: "Pengguna tidak ditemukan",
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

  static createSchema = {
    tags: ["Users"],
    summary: "Buat pengguna baru",
    request: {
      body: {
        content: {
          "application/json": {
            schema: UserCreateSchema,
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Pengguna berhasil dibuat",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: UserPublicSchema,
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

  static updateSchema = {
    tags: ["Users"],
    summary: "Perbarui data pengguna",
    request: {
      params: z.object({
        username: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: UserUpdateSchema,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Data pengguna berhasil diperbarui",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: UserPublicSchema,
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
        description: "Pengguna tidak ditemukan",
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

  static deleteSchema = {
    tags: ["Users"],
    summary: "Hapus pengguna",
    request: {
      params: z.object({
        username: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Pengguna berhasil dihapus",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              user: UserPublicSchema,
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
        description: "Pengguna tidak ditemukan",
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

  // Helper for data validation
  private static async validateData<T>(c: AppContext, schema: any): Promise<T> {
    const result: Record<string, unknown> = {};

    if (schema.request?.query) {
      const queryResult = schema.request.query.safeParse(c.req.query());
      if (!queryResult.success) {
        throw new Error(`Query validation failed: ${queryResult.error.message}`);
      }
      result.query = queryResult.data;
    }

    if (schema.request?.params) {
      const paramsResult = schema.request.params.safeParse(c.req.param());
      if (!paramsResult.success) {
        throw new Error(`Params validation failed: ${paramsResult.error.message}`);
      }
      result.params = paramsResult.data;
    }

    if (schema.request?.body?.content?.["application/json"]?.schema) {
      try {
        const body = await c.req.json();
        const bodySchema = schema.request.body.content["application/json"].schema;
        const bodyResult = bodySchema.safeParse(body);
        if (!bodyResult.success) {
          throw new Error(`Body validation failed: ${bodyResult.error.message}`);
        }
        result.body = bodyResult.data;
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation failed")) {
          throw error;
        }
        throw new Error("Invalid JSON body");
      }
    }

    return result as T;
  }

  // Handler methods
  static async list(c: AppContext) {
    const admin = ensureAdmin(c);
    if (!admin) {
      return c.json(
        { success: false, message: "Hak akses admin diperlukan" },
        403
      );
    }

    const users = await listUsers(c.env.DB);
    return c.json({ success: true, users });
  }

  static async get(c: AppContext) {
    const admin = ensureAdmin(c);
    if (!admin) {
      return c.json(
        { success: false, message: "Hak akses admin diperlukan" },
        403
      );
    }

    const data = await UserController.validateData<{ 
      params: { username: string } 
    }>(c, UserController.getSchema);
    
    const { username } = data.params;
    const user = await getUser(c.env.DB, username);
    
    if (!user) {
      return c.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        404
      );
    }
    
    return c.json({ success: true, user });
  }

  static async create(c: AppContext) {
    const admin = ensureAdmin(c);
    if (!admin) {
      return c.json(
        { success: false, message: "Hak akses admin diperlukan" },
        403
      );
    }

    const data = await UserController.validateData<{ 
      body: { 
        username: string; 
        email: string; 
        password: string; 
        full_name?: string;
        is_admin?: boolean;
      } 
    }>(c, UserController.createSchema);
    
    try {
      const user = await createUser(c.env.DB, data.body);
      return c.json({ success: true, user }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat pengguna";
      return c.json({ success: false, message }, 400);
    }
  }

  static async update(c: AppContext) {
    const admin = ensureAdmin(c);
    if (!admin) {
      return c.json(
        { success: false, message: "Hak akses admin diperlukan" },
        403
      );
    }

    const data = await UserController.validateData<{ 
      params: { username: string },
      body: { 
        email?: string; 
        password?: string; 
        full_name?: string;
        is_admin?: boolean;
      }
    }>(c, UserController.updateSchema);
    
    const { username } = data.params;
    
    try {
      const user = await updateUser(c.env.DB, username, data.body);
      return c.json({ success: true, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
      const status = message.includes("tidak ditemukan") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }

  static async delete(c: AppContext) {
    const admin = ensureAdmin(c);
    if (!admin) {
      return c.json(
        { success: false, message: "Hak akses admin diperlukan" },
        403
      );
    }

    const data = await UserController.validateData<{ 
      params: { username: string } 
    }>(c, UserController.deleteSchema);
    
    const { username } = data.params;
    
    try {
      const user = await deleteUser(c.env.DB, username);
      return c.json({ success: true, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pengguna";
      const status = message.includes("tidak ditemukan") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }
}
