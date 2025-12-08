/**
 * Database Initialization Utility
 * 
 * Creates a reusable database initializer that ensures setup runs only once.
 * This eliminates code duplication across service files.
 * 
 * @example
 * const ensureInitialized = createDbInitializer(async (db) => {
 *   await db.batch([
 *     db.prepare('CREATE TABLE IF NOT EXISTS ...'),
 *   ]);
 * });
 * 
 * // In service methods:
 * await ensureInitialized(db);
 */
export const createDbInitializer = (
    setupFn: (db: D1Database) => Promise<void>
): ((db: D1Database) => Promise<void>) => {
    let promise: Promise<void> | undefined;

    return async (db: D1Database): Promise<void> => {
        if (!promise) {
            promise = setupFn(db);
        }
        await promise;
    };
};

/**
 * Creates a database initializer with batch operations.
 * Convenience wrapper for common pattern of creating tables and indexes.
 * 
 * @example
 * const ensureInitialized = createBatchDbInitializer((db) => [
 *   db.prepare('CREATE TABLE IF NOT EXISTS users (...)'),
 *   db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'),
 * ]);
 */
export const createBatchDbInitializer = (
    statementsFactory: (db: D1Database) => D1PreparedStatement[]
): ((db: D1Database) => Promise<void>) => {
    let promise: Promise<void> | undefined;

    return async (db: D1Database): Promise<void> => {
        if (!promise) {
            promise = (async () => {
                await db.batch(statementsFactory(db));
            })();
        }
        await promise;
    };
};
