import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { roles } from '../db/schema/index.js';
import { hasPermission } from '../shared/permissions.js';
import { Role } from '../shared/constants.js';

const cache = new Map<string, { keys: string[]; at: number }>();
const CACHE_TTL_MS = 30_000;

/** Load permission keys for a role from the DB (custom roles), falling back to the static matrix. */
export async function getRolePermissionKeys(role: string): Promise<string[] | null> {
  const cached = cache.get(role);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.keys;

  try {
    const found = await db.select({ permissionKeys: roles.permissionKeys })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1);
    const keys = found[0]?.permissionKeys ?? null;
    if (keys) cache.set(role, { keys, at: Date.now() });
    return keys;
  } catch {
    return null;
  }
}

export function invalidateRoleCache(name?: string): void {
  if (name) {
    cache.delete(name);
  } else {
    Object.keys(cache).forEach((k) => cache.delete(k));
  }
}

/** Permission check that understands custom roles from the roles table. */
export async function hasRolePermission(role: string, action: string): Promise<boolean> {
  // Fast path: static matrix covers built-in roles
  if (hasPermission(role as Role, action as any)) return true;

  const keys = await getRolePermissionKeys(role);
  if (!keys) return false;

  const [resource] = action.split(':');
  return keys.some((k) => k === action || k === `${resource}:*` || k === `${resource}:__all__` || k.endsWith('*') && k.split(':')[0] === resource);
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  state_observer: 'State Observer',
  lga_coordinator: 'LGA Coordinator',
  vigilante_leader: 'Vigilante Leader',
  community_admin: 'Community Leader',
  resident: 'Resident',
};

/** Human-readable label for a role key; falls back to the roles table then a transformed key. */
export async function roleLabel(role: string): Promise<string> {
  if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  try {
    const found = await db.select({ label: roles.label }).from(roles).where(eq(roles.name, role)).limit(1);
    if (found[0]?.label) return found[0].label;
  } catch { /* noop */ }
  return role.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}