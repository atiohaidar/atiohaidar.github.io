import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../models/types";

/**
 * Base controller class that provides common functionality for all controllers
 * Implements DRY principle by centralizing common response patterns
 */
export abstract class BaseController extends OpenAPIRoute {
  /**
   * Success response helper
   */
  protected successResponse(data: Record<string, any>, status: number = 200) {
    return Response.json(
      { success: true, ...data },
      { status }
    );
  }

  /**
   * Error response helper
   */
  protected errorResponse(message: string, status: number = 400) {
    return Response.json(
      { success: false, message },
      { status }
    );
  }

  /**
   * Extract context from request
   */
  protected getContext(request: Request): AppContext {
    return (request as any).context || {};
  }
}
