#!/usr/bin/env node
import { D1Database } from '@cloudflare/workers-types';
import { runSeeders } from '../src/seeders';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Type untuk environment
interface Env {
  DB: D1Database;
}

// Handler untuk menjalankan seeder
async function main() {
  console.log('🚀 Starting database seeding...');
  
  // Inisialisasi database
  // Di production, gunakan binding D1 yang sebenarnya
  // Contoh: const db = env.DB;
  const db = process.env.NODE_ENV === 'production'
    ? (globalThis as any).DB // Sesuaikan dengan cara Anda mengakses D1 di production
    : {
      async prepare(query: string) {
        console.log(`Executing: ${query}`);
        return {
          bind: (...values: any[]) => ({
            all: async () => ({ results: [] }),
            run: async () => ({}),
            first: async () => ({}),
          }),
        };
      },

      async exec(query: string) {
        console.log(`Executing: ${query}`);
        return { success: true };
      }
    };

  try {
    // Jalankan seeder
    await runSeeders(db);
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:');
    console.error(error);
    process.exit(1);
  }
}

// Jalankan script
main();
