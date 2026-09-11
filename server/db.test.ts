import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { migrateDatabase, openDatabase } from './db.js';

const testPath = resolve('.local-data/test-multi-board.db');

afterEach(() => {
  for (const suffix of ['', '-shm', '-wal']) {
    const path = `${testPath}${suffix}`;
    if (existsSync(path)) rmSync(path, { force: true });
  }
});

describe('node:sqlite foundation', () => {
  it('opens the local database and applies the initial migration', () => {
    const db = openDatabase(testPath);
    migrateDatabase(db);

    const row = db.prepare('SELECT version FROM schema_migration WHERE version = 1').get() as { version: number } | undefined;
    expect(row?.version).toBe(1);

    db.close();
  });
});
