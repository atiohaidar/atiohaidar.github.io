import { OpenAPIRoute, OpenAPIRouteSchema } from 'chanfana';
import { z } from 'zod';
import * as whiteboardService from '../services/whiteboards';
import type { Bindings } from '../models/types';

// Schema definitions
const WhiteboardSchema = z.object({
    id: z.string(),
    title: z.string(),
    created_by: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    is_active: z.number()
});

const CreateWhiteboardSchema = z.object({
    title: z.string().min(1).max(100),
    created_by: z.string().optional().default('anonymous')
});

const UpdateWhiteboardSchema = z.object({
    title: z.string().min(1).max(100)
});

const StrokeSchema = z.object({
    id: z.string(),
    whiteboard_id: z.string(),
    user_id: z.string(),
    stroke_data: z.string(),
    created_at: z.string()
});

// List Whiteboards
export class ListWhiteboards extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'List all active whiteboards',
        request: {
            query: z.object({
                user_id: z.string().optional()
            }).optional()
        },
        responses: {
            '200': {
                description: 'List of whiteboards',
                content: {
                    'application/json': {
                        schema: z.object({
                            whiteboards: z.array(WhiteboardSchema)
                        })
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const whiteboards = await whiteboardService.getWhiteboards(c.env.DB);

        return {
            whiteboards
        };
    }
}

// Get Whiteboard
export class GetWhiteboard extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Get a specific whiteboard',
        request: {
            params: z.object({
                id: z.string()
            })
        },
        responses: {
            '200': {
                description: 'Whiteboard details',
                content: {
                    'application/json': {
                        schema: WhiteboardSchema
                    }
                }
            },
            '404': {
                description: 'Whiteboard not found'
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const whiteboard = await whiteboardService.getWhiteboard(c.env.DB, data.params.id);

        if (!whiteboard) {
            return Response.json({ error: 'Whiteboard not found' }, { status: 404 });
        }

        return whiteboard;
    }
}

// Create Whiteboard
export class CreateWhiteboard extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Create a new whiteboard',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateWhiteboardSchema
                    }
                }
            }
        },
        responses: {
            '201': {
                description: 'Whiteboard created',
                content: {
                    'application/json': {
                        schema: WhiteboardSchema
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const { title, created_by } = data.body;
        const whiteboard = await whiteboardService.createWhiteboard(c.env.DB, title, created_by);

        return Response.json(whiteboard, { status: 201 });
    }
}

// Update Whiteboard
export class UpdateWhiteboard extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Update a whiteboard',
        request: {
            params: z.object({
                id: z.string()
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateWhiteboardSchema
                    }
                }
            }
        },
        responses: {
            '200': {
                description: 'Whiteboard updated',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string()
                        })
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        await whiteboardService.updateWhiteboard(c.env.DB, data.params.id, data.body.title);

        return {
            message: 'Whiteboard updated successfully'
        };
    }
}

// Delete Whiteboard
export class DeleteWhiteboard extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Delete a whiteboard',
        request: {
            params: z.object({
                id: z.string()
            })
        },
        responses: {
            '200': {
                description: 'Whiteboard deleted',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string()
                        })
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        await whiteboardService.deleteWhiteboard(c.env.DB, data.params.id);

        return {
            message: 'Whiteboard deleted successfully'
        };
    }
}

// Get Whiteboard Strokes
export class GetWhiteboardStrokes extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Get all strokes for a whiteboard',
        request: {
            params: z.object({
                id: z.string()
            })
        },
        responses: {
            '200': {
                description: 'List of strokes',
                content: {
                    'application/json': {
                        schema: z.object({
                            strokes: z.array(StrokeSchema)
                        })
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const strokes = await whiteboardService.getStrokes(c.env.DB, data.params.id);

        return {
            strokes
        };
    }
}

// Clear Whiteboard
export class ClearWhiteboard extends OpenAPIRoute {
    schema: OpenAPIRouteSchema = {
        tags: ['Whiteboards'],
        summary: 'Clear all strokes from a whiteboard',
        request: {
            params: z.object({
                id: z.string()
            })
        },
        responses: {
            '200': {
                description: 'Whiteboard cleared',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string()
                        })
                    }
                }
            }
        }
    };

    async handle(c: import('../models/types').AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        await whiteboardService.clearStrokes(c.env.DB, data.params.id);

        return {
            message: 'Whiteboard cleared successfully'
        };
    }
}
