import { D1Database } from '@cloudflare/workers-types';
import { hashPassword } from '../utils/auth';

export const UserSeeder: import('./index').Seeder = {
  name: 'user-seed',
  async run(db: D1Database) {
    const hashedPassword = await hashPassword('admin123');
    
    await db.prepare(
      `INSERT INTO users (username, email, password, full_name, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(username) DO NOTHING`
    ).bind(
      'admin',
      'admin@example.com',
      hashedPassword,
      'Administrator'
    ).run();
  }
};
