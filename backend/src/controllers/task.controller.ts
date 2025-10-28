import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { 
  listTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} from "../services/tasks";
import { type AppContext, Task, TaskCreateSchema, TaskUpdateSchema } from "../models/types";

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
    // @ts-ignore - getValidatedData is available on OpenAPIRoute instance
    return await new OpenAPIRoute().getValidatedData({ schema });
  }

  // Handler methods
  static async list(c: AppContext) {
    const data = await this.validateData<{ 
      query: { page: number; isCompleted?: boolean } 
    }>(c, TaskController.listSchema);
    
    const { page, isCompleted } = data.query;
    const tasks = await listTasks(c.env.DB, { page, isCompleted });
    return c.json({ success: true, tasks });
  }

  static async get(c: AppContext) {
    const data = await this.validateData<{ 
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
    
    return c.json({ success: true, task });
  }

  static async create(c: AppContext) {
    const data = await this.validateData<{ 
      body: { title: string; description?: string; isCompleted?: boolean } 
    }>(c, TaskController.createSchema);
    
    try {
      const task = await createTask(c.env.DB, data.body);
      return c.json({ success: true, task }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create task";
      return c.json({ success: false, message }, 400);
    }
  }

  static async update(c: AppContext) {
    const data = await this.validateData<{ 
      params: { taskSlug: string },
      body: { title?: string; description?: string; isCompleted?: boolean }
    }>(c, TaskController.updateSchema);
    
    const { taskSlug } = data.params;
    
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
    const data = await this.validateData<{ 
      params: { taskSlug: string } 
    }>(c, TaskController.deleteSchema);
    
    const { taskSlug } = data.params;
    
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
