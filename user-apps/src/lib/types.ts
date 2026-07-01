// ─── Ogbenjuwa Citizen Portal — Shared Types ───────────────────────────

export type ResidentAlertType = 'attack' | 'fire' | 'medical' | 'abduction' | 'other';

export type SeverityLevel = 'high' | 'medium' | 'low';

// ─── Auth ──────────────────────────────────────────────────────────────

export interface ResidentSession {
  id: string;
  phone: string;
  role: 'resident';
  name: string;
  lga: string;
  ward: string;
  token: string;
  loginAt: number;
  expiresAt: number;
}

// ─── Profile ────────────────────────────────────────────────────────────

export interface ResidentProfile {
  name: string;
  phone: string;
  lga: string;
  ward: string;
  avatar?: string;
  verified: boolean;
  connections: string[];
  preferences: ResidentPreferences;
  createdAt: number;
  updatedAt: number;
}

export interface ResidentPreferences {
  smsAlerts: boolean;
  inAppNotifications: boolean;
  language: 'en' | 'idoma';
}

// ─── Public Alert (safe for resident viewing) ──────────────────────────

export interface PublicAlert {
  id: string;
  type: string;
  severity: SeverityLevel;
  lga: string;
  time: string;
  description: string;
}

// ─── Public Patrol Stats (aggregated only — NO member details) ─────────

export interface PublicPatrolStats {
  activePatrolsToday: number;
  coveragePercent: number;
  checkinsToday: number;
  sightingsToday: number;
}

// ─── LGA Community Stats ───────────────────────────────────────────────

export interface LgaCommunityStats {
  lga: string;
  totalAlerts: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

// ─── Resident Directory ────────────────────────────────────────────────

export interface ResidentPublicProfile {
  id: string;
  name: string;
  lga: string;
  ward: string;
  avatar?: string;
  verified: boolean;
}

export type ConnectionStatus = 'none' | 'pending' | 'connected';

// ─── Quick Report ──────────────────────────────────────────────────────

export interface QuickReport {
  id: string;
  type: ResidentAlertType;
  lga: string;
  description: string;
  timestamp: number;
  status: 'submitted';
}
