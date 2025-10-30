import type { Bindings } from '../models/types';

export interface Whiteboard {
    id: string;
    title: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_active: number;
}

export interface WhiteboardStroke {
    id: string;
    whiteboard_id: string;
    user_id: string;
    stroke_data: string;
    created_at: string;
}

export class WhiteboardService {
    private env: Bindings;

    constructor(env: Bindings) {
        this.env = env;
    }

    async createWhiteboard(title: string, createdBy: string): Promise<Whiteboard> {
        const id = `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await this.env.DB.prepare(
            `INSERT INTO whiteboards (id, title, created_by, created_at, updated_at, is_active)
             VALUES (?, ?, ?, ?, ?, 1)`
        )
            .bind(id, title, createdBy, now, now)
            .run();

        return {
            id,
            title,
            created_by: createdBy,
            created_at: now,
            updated_at: now,
            is_active: 1
        };
    }

    async getWhiteboards(userId?: string): Promise<Whiteboard[]> {
        let query = `SELECT * FROM whiteboards WHERE is_active = 1`;
        const params: any[] = [];

        if (userId) {
            query += ` AND created_by = ?`;
            params.push(userId);
        }

        query += ` ORDER BY updated_at DESC`;

        const result = await this.env.DB.prepare(query)
            .bind(...params)
            .all();

        return (result.results as Whiteboard[]) || [];
    }

    async getWhiteboard(id: string): Promise<Whiteboard | null> {
        const result = await this.env.DB.prepare(
            `SELECT * FROM whiteboards WHERE id = ? AND is_active = 1`
        )
            .bind(id)
            .first();

        return result as Whiteboard | null;
    }

    async updateWhiteboard(id: string, title: string): Promise<void> {
        const now = new Date().toISOString();
        
        await this.env.DB.prepare(
            `UPDATE whiteboards SET title = ?, updated_at = ? WHERE id = ?`
        )
            .bind(title, now, id)
            .run();
    }

    async deleteWhiteboard(id: string): Promise<void> {
        // Soft delete
        await this.env.DB.prepare(
            `UPDATE whiteboards SET is_active = 0 WHERE id = ?`
        )
            .bind(id)
            .run();

        // Also delete associated strokes
        await this.env.DB.prepare(
            `DELETE FROM whiteboard_strokes WHERE whiteboard_id = ?`
        )
            .bind(id)
            .run();
    }

    async saveStroke(whiteboardId: string, userId: string, strokeData: any): Promise<WhiteboardStroke> {
        const id = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const strokeDataStr = JSON.stringify(strokeData);

        await this.env.DB.prepare(
            `INSERT INTO whiteboard_strokes (id, whiteboard_id, user_id, stroke_data, created_at)
             VALUES (?, ?, ?, ?, ?)`
        )
            .bind(id, whiteboardId, userId, strokeDataStr, now)
            .run();

        return {
            id,
            whiteboard_id: whiteboardId,
            user_id: userId,
            stroke_data: strokeDataStr,
            created_at: now
        };
    }

    async getStrokes(whiteboardId: string): Promise<WhiteboardStroke[]> {
        const result = await this.env.DB.prepare(
            `SELECT * FROM whiteboard_strokes 
             WHERE whiteboard_id = ? 
             ORDER BY created_at ASC`
        )
            .bind(whiteboardId)
            .all();

        return (result.results as WhiteboardStroke[]) || [];
    }

    async clearStrokes(whiteboardId: string): Promise<void> {
        await this.env.DB.prepare(
            `DELETE FROM whiteboard_strokes WHERE whiteboard_id = ?`
        )
            .bind(whiteboardId)
            .run();
    }
}
