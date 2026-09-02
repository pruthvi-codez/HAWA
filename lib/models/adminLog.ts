import { db } from '@/db';
import { newId } from '@/lib/ids';

export function logAdminAction(input: { adminId: string; adminName: string; action: string; details?: string }): void {
  db.prepare('INSERT INTO admin_logs (id, admin_id, admin_name, action, details) VALUES (?, ?, ?, ?, ?)').run(
    newId('log'),
    input.adminId,
    input.adminName,
    input.action,
    input.details || null
  );
}

export function getRecentAdminLogs(limit = 50) {
  return db.prepare('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?').all(limit);
}
