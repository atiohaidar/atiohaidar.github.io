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

export async function createWhiteboard(db: D1Database, title: string, createdBy: string): Promise<Whiteboard> {
    const id = `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await db.prepare(
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

export async function getWhiteboards(db: D1Database, userId?: string): Promise<Whiteboard[]> {
    let query = `SELECT * FROM whiteboards WHERE is_active = 1`;
    const params: any[] = [];

    if (userId) {
        query += ` AND created_by = ?`;
        params.push(userId);
    }

    query += ` ORDER BY updated_at DESC`;

    const result = await db.prepare(query)
        .bind(...params)
        .all();

    return (result.results as Whiteboard[]) || [];
}

export async function getWhiteboard(db: D1Database, id: string): Promise<Whiteboard | null> {
    const result = await db.prepare(
        `SELECT * FROM whiteboards WHERE id = ? AND is_active = 1`
    )
        .bind(id)
        .first();

    return result as Whiteboard | null;
}

export async function updateWhiteboard(db: D1Database, id: string, title: string): Promise<void> {
    const now = new Date().toISOString();
    
    await db.prepare(
        `UPDATE whiteboards SET title = ?, updated_at = ? WHERE id = ?`
    )
        .bind(title, now, id)
        .run();
}

export async function deleteWhiteboard(db: D1Database, id: string): Promise<void> {
    // Soft delete
    await db.prepare(
        `UPDATE whiteboards SET is_active = 0 WHERE id = ?`
    )
        .bind(id)
        .run();

    // Also delete associated strokes
    await db.prepare(
        `DELETE FROM whiteboard_strokes WHERE whiteboard_id = ?`
    )
        .bind(id)
        .run();
}

export async function saveStroke(db: D1Database, whiteboardId: string, userId: string, strokeData: any): Promise<WhiteboardStroke> {
    const id = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const strokeDataStr = JSON.stringify(strokeData);

    await db.prepare(
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

export async function getStrokes(db: D1Database, whiteboardId: string): Promise<WhiteboardStroke[]> {
    const result = await db.prepare(
        `SELECT * FROM whiteboard_strokes 
         WHERE whiteboard_id = ? 
         ORDER BY created_at ASC`
    )
        .bind(whiteboardId)
        .all();

    return (result.results as WhiteboardStroke[]) || [];
}

export async function clearStrokes(db: D1Database, whiteboardId: string): Promise<void> {
    await db.prepare(
        `DELETE FROM whiteboard_strokes WHERE whiteboard_id = ?`
    )
        .bind(whiteboardId)
        .run();
}
