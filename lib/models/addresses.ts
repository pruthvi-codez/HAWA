import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Address } from '@/lib/types';

function parseRow(row: any): Address | undefined {
  if (!row) return undefined;
  return { ...row, is_default: !!row.is_default };
}

export function getAddressesForUser(userId: string): Address[] {
  const rows = db
    .prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC')
    .all(userId) as any[];
  return rows.map((r) => parseRow(r)!);
}

export function getAddressById(id: string): Address | undefined {
  return parseRow(db.prepare('SELECT * FROM addresses WHERE id = ?').get(id));
}

export function createAddress(input: Omit<Address, 'id' | 'created_at'>): Address {
  const id = newId('addr');
  if (input.is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(input.user_id);
  }
  db.prepare(
    `INSERT INTO addresses (id, user_id, name, phone, address_line, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, input.user_id, input.name, input.phone, input.address_line, input.city, input.state, input.pincode, input.is_default ? 1 : 0);
  return getAddressById(id)!;
}

export function updateAddress(id: string, input: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>): void {
  const current = getAddressById(id);
  if (!current) throw new Error('Address not found');
  if (input.is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(current.user_id);
  }
  db.prepare(
    `UPDATE addresses SET name = ?, phone = ?, address_line = ?, city = ?, state = ?, pincode = ?, is_default = ? WHERE id = ?`
  ).run(
    input.name ?? current.name,
    input.phone ?? current.phone,
    input.address_line ?? current.address_line,
    input.city ?? current.city,
    input.state ?? current.state,
    input.pincode ?? current.pincode,
    (input.is_default ?? current.is_default) ? 1 : 0,
    id
  );
}

export function deleteAddress(id: string): void {
  db.prepare('DELETE FROM addresses WHERE id = ?').run(id);
}
