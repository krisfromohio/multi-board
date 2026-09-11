import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type MultiBoardDatabase = DatabaseSync;

export function openDatabase(path = resolve('.local-data/multi-board.db')): MultiBoardDatabase {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 5_000 });
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  return db;
}

export function migrateDatabase(db: MultiBoardDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migration (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const applied = db.prepare('SELECT version FROM schema_migration WHERE version = 1').get();
  if (!applied) {
    const transaction = db.prepare(`
      INSERT INTO schema_migration(version, applied_at)
      VALUES (?, ?)
    `);
    transaction.run(1, new Date().toISOString());
  }
}
