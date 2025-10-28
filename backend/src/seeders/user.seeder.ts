import { D1Database } from '@cloudflare/workers-types';
import { hashPassword } from '../utils/auth';

export const UserSeeder: import('./index').Seeder = {
  name: 'user-seed',
  async run(db: D1Database) {
    const adminHash = await hashPassword('admin123');
    const userHash = await hashPassword('user123');
    
    await db.batch([
      db.prepare(
        `INSERT INTO users (username, name, password, role, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(username) DO UPDATE SET password = excluded.password`
      ).bind('admin', 'Administrator', adminHash, 'admin'),
      db.prepare(
        `INSERT INTO users (username, name, password, role, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(username) DO UPDATE SET password = excluded.password`
      ).bind('user', 'Sample Member', userHash, 'member')
    ]);
    
    console.log('Users seeded with hashed passwords');
  }
};
