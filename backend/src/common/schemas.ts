import { Bool, Str } from "chanfana";
import { z } from "zod";

/**
 * Common OpenAPI response schemas to reduce duplication
 */

export const SuccessResponseSchema = z.object({
  success: Bool(),
});

export const ErrorResponseSchema = z.object({
  success: Bool(),
  message: Str(),
});

export const createSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T, dataKey: string) => {
  return z.object({
    success: Bool(),
    [dataKey]: dataSchema,
  });
};

/**
 * Common response definitions for OpenAPI schemas
 */
export const CommonResponses = {
  "400": {
    description: "Bad request",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  "401": {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  "403": {
    description: "Forbidden - Insufficient permissions",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  "404": {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
  "500": {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  },
};
