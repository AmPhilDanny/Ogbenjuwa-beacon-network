// ─── Ogbenjuwa Community Safety Network — Shared Types ───────────────────

export interface Village {
  name: string;
  lga: string;
  lat: number;
  lng: number;
  pop: number;
}

export interface Contact {
  name: string;
  initials: string;
  phone: string;
  village: string;
}

export interface PatrolMember {
  id: number;
  name: string;
  role: PatrolRole;
  lat: number;
  lng: number;
  active: boolean;
  lastSeen: string;
}

export type PatrolRole = 'Team Leader' | 'Scout' | 'Patrol Member' | 'Radio Operator';

export interface AlertType {
  id: AlertTypeId;
  label: string;
  idoma: string;
  icon: string;
  color: string;
  sms: string;
}

export type AlertTypeId = 'attack' | 'fire' | 'medical' | 'abduction' | 'other';

export type SeverityLevel = 'high' | 'medium' | 'low';

export interface Resource {
  type: ResourceType;
  name: string;
  lga: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
}

export type ResourceType = 'shelter' | 'water' | 'medical' | 'food' | 'evacuation';

export interface FamilyEntry {
  id: string;
  name: string;
  age: number;
  gender: string;
  lga: string;
  village: string;
  status: RegistryStatus;
  registeredAt: string;
  camp: string | null;
}

export type RegistryStatus = 'searching' | 'at_camp' | 'reunified';

// ─── Auth types ─────────────────────────────────────────────────────────

export type UserRole =
  | 'community_admin'
  | 'vigilante_leader'
  | 'lga_coordinator'
  | 'state_observer';

export type PageId =
  | 'alert'
  | 'patrol'
  | 'reunify'
  | 'dashboard'
  | 'user-dashboard'
  | 'feed'
  | 'report'
  | 'resources'
  | 'neighborhood'
  | 'profile';

export interface Session {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
  lga: string;
  token: string;
  loginAt: number;
  expiresAt: number;
}

export type RolePermissionMap = Record<UserRole, PageId[]>;

// ─── Incident types (existing) ──────────────────────────────────────────

export interface Incident {
  id: string;
  type: 'alert' | 'announcement' | 'incident' | 'info';
  title: string;
  author: string;
  location: string;
  time: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: number;
}

// ─── Dashboard types ────────────────────────────────────────────────────

export interface DashboardIncident {
  id: string;
  lga: string;
  type: string;
  time: string;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface LGAResponseTime {
  lga: string;
  time: string; // "M:SS" format
}

export interface LGASeverity {
  lga: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}
