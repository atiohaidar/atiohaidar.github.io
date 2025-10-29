import { Bool, Num } from "chanfana";
import { z } from "zod";
import { 
  listTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} from "../services/tasks";
import { type AppContext, Task, TaskCreateSchema, TaskUpdateSchema } from "../models/types";
import { getTokenPayloadFromRequest } from "../middlewares/auth";

export class TaskController {
  // Schema definitions
  static listSchema = {
    tags: ["Tasks"],
    summary: "List Tasks",
    request: {
      query: z.object({
        page: Num({
          description: "Page number",
          default: 0,
        }),
        isCompleted: Bool({
          description: "Filter by completed flag",
          required: false,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of tasks",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              tasks: Task.array(),
            }),
          },
        },
      },
    },
  };

  static getSchema = {
    tags: ["Tasks"],
    summary: "Get a single Task",
    request: {
      params: z.object({
        taskSlug: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Returns the requested task",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              task: Task,
            }),
          },
        },
      },
      "404": {
        description: "Task not found",
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
    tags: ["Tasks"],
    summary: "Create a new Task",
    request: {
      body: {
        content: {
          "application/json": {
            schema: TaskCreateSchema,
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Returns the created task",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              task: Task,
            }),
          },
        },
      },
      "400": {
        description: "Validation error",
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
    tags: ["Tasks"],
    summary: "Update a Task",
    request: {
      params: z.object({
        taskSlug: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: TaskUpdateSchema,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the updated task",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              task: Task,
            }),
          },
        },
      },
      "400": {
        description: "Validation error",
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
        description: "Task not found",
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
    tags: ["Tasks"],
    summary: "Delete a Task",
    request: {
      params: z.object({
        taskSlug: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Returns the deleted task",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              task: Task,
            }),
          },
        },
      },
      "404": {
        description: "Task not found",
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
    // Manual validation since OpenAPIRoute instantiation fails
    if (schema.request?.query) {
      // Convert query string values to appropriate types before validation
      const query = c.req.query();
      const convertedQuery: any = {};
      
      if ('page' in query && query.page !== undefined) {
        convertedQuery.page = parseInt(query.page, 10);
        if (isNaN(convertedQuery.page)) {
          throw new Error('Query validation failed: page must be a valid number');
        }
      }
      
      if ('is_completed' in query && query.is_completed !== undefined) {
        convertedQuery.is_completed = query.is_completed === 'true';
      }
      
      // Copy any other query parameters
      Object.keys(query).forEach(key => {
        if (!(key in convertedQuery)) {
          convertedQuery[key] = query[key];
        }
      });
      
      const queryResult = schema.request.query.safeParse(convertedQuery);
      if (!queryResult.success) {
        throw new Error(`Query validation failed: ${queryResult.error.message}`);
      }
      return { query: queryResult.data } as T;
    }
    
    if (schema.request?.params) {
      const paramsResult = schema.request.params.safeParse(c.req.param());
      if (!paramsResult.success) {
        throw new Error(`Params validation failed: ${paramsResult.error.message}`);
      }
      return { params: paramsResult.data } as T;
    }
    
    if (schema.request?.body?.content?.['application/json']?.schema) {
      try {
        const body = await c.req.json();
        const bodySchema = schema.request.body.content['application/json'].schema;
        const bodyResult = bodySchema.safeParse(body);
        if (!bodyResult.success) {
          throw new Error(`Body validation failed: ${bodyResult.error.message}`);
        }
        return { body: bodyResult.data } as T;
      } catch (error) {
        if (error instanceof Error && error.message.includes('validation failed')) {
          throw error;
        }
        throw new Error('Invalid JSON body');
      }
    }
    
    return {} as T;
  }

  // Handler methods
  static async list(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await TaskController.validateData<{ 
      query: { page: number; is_completed?: boolean } 
    }>(c, TaskController.listSchema);
    
    const { page, is_completed } = data.query;
    
    // Admin can see all tasks, members can only see their own
    const owner = payload.role === "admin" ? undefined : payload.sub;
    
    const tasks = await listTasks(c.env.DB, { page, isCompleted: is_completed, owner });
    return c.json({ success: true, tasks });
  }

  static async get(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await TaskController.validateData<{ 
      params: { taskSlug: string } 
    }>(c, TaskController.getSchema);
    
    const { taskSlug } = data.params;
    const task = await getTask(c.env.DB, taskSlug);
    
    if (!task) {
      return c.json(
        { success: false, message: "Task not found" },
        404
      );
    }

    // Check authorization: admin can see all, members can only see their own
    if (payload.role !== "admin" && task.owner !== payload.sub) {
      return c.json(
        { success: false, message: "Akses ditolak" },
        403
      );
    }
    
    return c.json({ success: true, task });
  }

  static async create(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await TaskController.validateData<{ 
      body: { name: string; description?: string; completed?: boolean } 
    }>(c, TaskController.createSchema);
    
    try {
      const task = await createTask(c.env.DB, data.body, payload.sub);
      return c.json({ success: true, task }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create task";
      return c.json({ success: false, message }, 400);
    }
  }

  static async update(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await TaskController.validateData<{ 
      params: { taskSlug: string },
      body: { name?: string; description?: string; completed?: boolean }
    }>(c, TaskController.updateSchema);
    
    const { taskSlug } = data.params;
    
    // Check if task exists and belongs to user
    const existingTask = await getTask(c.env.DB, taskSlug);
    if (!existingTask) {
      return c.json({ success: false, message: "Task not found" }, 404);
    }

    // Check authorization: admin can update all, members can only update their own
    if (payload.role !== "admin" && existingTask.owner !== payload.sub) {
      return c.json({ success: false, message: "Akses ditolak" }, 403);
    }
    
    try {
      const task = await updateTask(c.env.DB, taskSlug, data.body);
      return c.json({ success: true, task });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update task";
      const status = message.includes("not found") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }

  static async delete(c: AppContext) {
    const payload = getTokenPayloadFromRequest(c);
    if (!payload) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const data = await TaskController.validateData<{ 
      params: { taskSlug: string } 
    }>(c, TaskController.deleteSchema);
    
    const { taskSlug } = data.params;
    
    // Check if task exists and belongs to user
    const existingTask = await getTask(c.env.DB, taskSlug);
    if (!existingTask) {
      return c.json({ success: false, message: "Task not found" }, 404);
    }

    // Check authorization: admin can delete all, members can only delete their own
    if (payload.role !== "admin" && existingTask.owner !== payload.sub) {
      return c.json({ success: false, message: "Akses ditolak" }, 403);
    }
    
    try {
      const task = await deleteTask(c.env.DB, taskSlug);
      return c.json({ success: true, task });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete task";
      const status = message.includes("not found") ? 404 : 400;
      return c.json({ success: false, message }, status);
    }
  }
}
