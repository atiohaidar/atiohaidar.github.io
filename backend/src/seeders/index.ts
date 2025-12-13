import { D1Database } from '@cloudflare/workers-types';
import { UserSeeder } from './user.seeder';
import { TaskSeeder } from './task.seeder';
import { seedGameData } from './game.seeder';

export interface Seeder {
  name: string;
  run(db: D1Database): Promise<void>;
}

// Game seeder wrapper
const GameSeeder: Seeder = {
  name: 'GameSeeder',
  async run(db: D1Database) {
    const result = await seedGameData(db);
    console.log(`🎮 Seeded game data: ${result.crops} crops, ${result.items} items, ${result.achievements} achievements`);
  }
};

const seeders: Seeder[] = [
  UserSeeder,
  TaskSeeder,
  GameSeeder,
  // Tambahkan seeder lain di sini
];

export async function runSeeders(db: D1Database) {
  console.log('🔍 Checking for seeders to run...');

  // Buat tabel untuk melacak seed yang sudah dijalankan
  await db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Dapatkan daftar seed yang sudah dijalankan
  const executedSeeds = await db.prepare(
    'SELECT name FROM _migrations'
  ).all<{ name: string }>();

  const executedSeedNames = new Set(executedSeeds.results?.map(s => s.name) || []);
  let seededCount = 0;

  // Jalankan seed yang belum dijalankan
  for (const seeder of seeders) {
    if (!executedSeedNames.has(seeder.name)) {
      console.log(`🌱 Running seeder: ${seeder.name}`);
      await seeder.run(db);

      // Tandai seed ini sudah dijalankan
      await db.prepare(
        'INSERT INTO _migrations (name) VALUES (?)'
      ).bind(seeder.name).run();

      seededCount++;
      console.log(`✅ Seeded: ${seeder.name}`);
    } else {
      console.log(`⏩ Skipping already executed seeder: ${seeder.name}`);
    }
  }

  if (seededCount > 0) {
    console.log(`\n✨ Successfully ran ${seededCount} seeders`);
  } else {
    console.log('\n✅ All seeders have already been executed');
  }
}
