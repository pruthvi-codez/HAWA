import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { User } from '@/lib/types';

function parseUserRow(row: any): User | undefined {
  if (!row) return undefined;
  return { ...row, email_verified: !!row.email_verified };
}

export function getUserByEmail(email: string): User | undefined {
  return parseUserRow(db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()));
}

export function getUserById(id: string): User | undefined {
  return parseUserRow(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

export function createUser(input: { name: string; email: string; phone?: string; passwordHash: string; role?: 'customer' | 'admin' }): User {
  const id = newId('user');
  db.prepare(
    `INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, input.name, input.email.toLowerCase(), input.phone || null, input.passwordHash, input.role || 'customer');
  return getUserById(id)!;
}

export function updateUserProfile(id: string, input: Partial<{ name: string; phone: string; email: string }>): void {
  const current = getUserById(id);
  if (!current) throw new Error('User not found');
  db.prepare('UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?').run(
    input.name ?? current.name,
    input.phone ?? current.phone,
    (input.email ?? current.email).toLowerCase(),
    id
  );
}

export function updateUserPassword(id: string, passwordHash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

export function touchLastLogin(id: string): void {
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(id);
}

export function setUserStatus(id: string, status: 'active' | 'deactivated'): void {
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
}

export function setResetToken(id: string, token: string | null, expiresAt: string | null): void {
  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(token, expiresAt, id);
}

export function getUserByResetToken(token: string): User | undefined {
  return parseUserRow(
    db.prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime('now')").get(token)
  );
}

export function getAllCustomers(): (User & { order_count: number; total_spent: number })[] {
  const rows = db
    .prepare(
      `SELECT u.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all() as any[];
  return rows.map((r) => ({ ...r, email_verified: !!r.email_verified }));
}

export function countCustomers(): number {
  return (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get() as { c: number }).c;
}

export function countNewCustomersSince(isoDate: string): number {
  return (
    db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer' AND created_at >= ?").get(isoDate) as {
      c: number;
    }
  ).c;
}
