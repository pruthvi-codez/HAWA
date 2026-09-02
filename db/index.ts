import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// A tiny helper so hot-reload in dev doesn't open a new file handle per reload.
declare global {
  // eslint-disable-next-line no-var
  var __hawaDb: Database.Database | undefined;
}

function createConnection() {
  const dbFile = process.env.DATABASE_FILE || './data.db';
  const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(process.cwd(), dbFile);
  const isNewFile = !fs.existsSync(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Always run the schema — every statement uses IF NOT EXISTS, so this is
  // a safe no-op on a database that already has its tables.
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  if (isNewFile) {
    // eslint-disable-next-line no-console
    console.log(`[db] Created new SQLite database at ${dbPath}`);
  }

  return db;
}

export const db = global.__hawaDb || createConnection();

if (process.env.NODE_ENV !== 'production') {
  global.__hawaDb = db;
}
