import { db } from '@/db';

export function getSetting<T = string>(key: string, fallback: T): T {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return row.value as unknown as T;
  }
}

export function setSetting(key: string, value: unknown): void {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    key,
    serialized
  );
}

export function getSettings<T extends Record<string, any>>(defaults: T): T {
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    (result as any)[key] = getSetting(key, (defaults as any)[key]);
  }
  return result;
}

export function setSettings(values: Record<string, unknown>): void {
  const run = db.transaction(() => {
    for (const [key, value] of Object.entries(values)) {
      setSetting(key, value);
    }
  });
  run();
}
