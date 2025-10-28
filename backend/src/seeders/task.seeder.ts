import { D1Database } from '@cloudflare/workers-types';

export const TaskSeeder: import('./index').Seeder = {
  name: 'task-seed',
  async run(db: D1Database) {
    // Pastikan user admin ada
    const admin = await db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind('admin').first<{id: number}>();

    if (!admin) {
      console.log('⚠️  Admin user not found, skipping task seeder');
      return;
    }

    const tasks = [
      {
        title: 'Menyelesaikan tugas backend',
        description: 'Menyelesaikan implementasi API untuk fitur tugas',
        is_completed: false,
        created_by: admin.id
      },
      {
        title: 'Membuat dokumentasi API',
        description: 'Membuat dokumentasi lengkap untuk semua endpoint API',
        is_completed: false,
        created_by: admin.id
      },
      {
        title: 'Testing API',
        description: 'Melakukan pengujian pada semua endpoint API',
        is_completed: true,
        created_by: admin.id
      }
    ];

    for (const task of tasks) {
      await db.prepare(
        `INSERT INTO tasks (title, description, is_completed, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(title) DO NOTHING`
      ).bind(
        task.title,
        task.description,
        task.is_completed ? 1 : 0,
        task.created_by
      ).run();
    }
  }
};
