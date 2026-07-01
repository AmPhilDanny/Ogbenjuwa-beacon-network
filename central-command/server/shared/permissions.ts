import { Role } from './constants.js';

export type ResourceAction = `${string}:${string}`;

const PERMISSION_MATRIX: Record<Role, ResourceAction[]> = {
  super_admin: [
    'users:*', 'lgas:*', 'wards:*', 'alerts:*', 'incidents:*',
    'patrols:*', 'announcements:*', 'analytics:*', 'audit:*',
    'api-keys:*', 'settings:*', 'sos:*', 'comms:*', 'reports:*',
  ],
  state_observer: [
    'alerts:read', 'incidents:read', 'patrols:read', 'analytics:read',
    'audit:read', 'lgas:read', 'wards:read', 'users:read', 'reports:read',
  ],
  lga_coordinator: [
    'users:read', 'users:create', 'users:update',
    'lgas:read', 'wards:read', 'wards:create', 'wards:update',
    'alerts:read', 'alerts:create', 'alerts:update', 'alerts:resolve',
    'incidents:read', 'incidents:create', 'incidents:update',
    'patrols:read', 'patrols:create', 'patrols:update',
    'announcements:create', 'announcements:read',
    'sos:read', 'sos:respond',
    'reports:read', 'reports:review',
    'comms:send', 'analytics:read',
  ],
  vigilante_leader: [
    'alerts:read', 'alerts:update',
    'incidents:read', 'incidents:update',
    'patrols:read', 'patrols:update',
    'patrols:checkin',
    'sos:read', 'sos:respond',
    'users:read', 'comms:send',
  ],
  community_admin: [
    'alerts:read',
    'alerts:create',
    'incidents:read',
    'incidents:create',
    'patrols:read',
    'reports:read',
    'comms:send',
    'users:read',
  ],
  resident: [
    'alerts:read',
    'reports:create',
    'reports:read',
    'comms:send',
    'sos:create',
  ],
};

export function hasPermission(role: Role, action: ResourceAction): boolean {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return false;

  for (const perm of permissions) {
    if (perm === `${action.split(':')[0]}:*`) return true;
    if (perm === action) return true;
  }
  return false;
}

export function canAccess(role: Role, resource: string, action: string): boolean {
  return hasPermission(role, `${resource}:${action}`);
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    super_admin: 100,
    state_observer: 80,
    lga_coordinator: 60,
    vigilante_leader: 40,
    community_admin: 20,
    resident: 10,
  };
  return (hierarchy[userRole] ?? 0) >= (hierarchy[requiredRole] ?? 0);
}
