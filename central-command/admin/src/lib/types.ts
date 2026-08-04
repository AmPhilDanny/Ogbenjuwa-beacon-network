export type Role = 'super_admin' | 'state_observer' | 'lga_coordinator' | 'vigilante_leader' | 'community_admin' | 'resident';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'investigating' | 'resolved' | 'false_alarm';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';
export type PatrolStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  phone?: string;
  role: Role;
  lgaId?: string | null;
  wardId?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lga {
  id: string;
  name: string;
  code: string;
  state: string;
  region: string;
  coverageTarget: number;
  lat?: string | number | null;
  lng?: string | number | null;
  radius?: string | number | null;
  isActive: boolean;
  wards?: Ward[];
  villages?: Village[];
}

export interface Village {
  id: string;
  name: string;
  lgaId: string;
  wardId?: string | null;
  lat?: string | number | null;
  lng?: string | number | null;
  population: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ward {
  id: string;
  name: string;
  lgaId: string;
  isActive: boolean;
}

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  lgaId: string;
  wardId?: string;
  location?: string;
  reportedBy: string;
  assignedTo?: string;
  status: AlertStatus;
  isPublic: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertType {
  id: string;
  key: string;
  label: string;
  labelIdoma?: string | null;
  icon?: string | null;
  color?: string | null;
  smsTemplate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  alertId?: string;
  type: string;
  title: string;
  description?: string;
  lgaId: string;
  wardId?: string;
  location?: string;
  status: IncidentStatus;
  priority: AlertSeverity;
  reportedBy: string;
  assignedTo?: string;
  responseNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatrolTeam {
  id: string;
  name: string;
  lgaId: string;
  wardId?: string | null;
  villageId?: string | null;
  leaderId: string;
  memberCount: number;
  isActive: boolean;
  lgaName?: string;
  leaderName?: string;
  wardName?: string;
  villageName?: string;
  members?: PatrolMember[];
  shifts?: PatrolShift[];
  createdAt?: string;
}

export interface PatrolMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  name?: string;
  role?: string;
}

export interface PatrolShift {
  id: string;
  teamId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: PatrolStatus;
  notes?: string;
  createdBy: string;
  createdAt?: string;
}

export interface PatrolCheckin {
  memberId: string;
  memberName?: string;
  lat: string;
  lng: string;
  timestamp: string;
  shiftId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    lgaId?: string | null;
    avatar?: string | null;
  };
  accessToken: string;
  refreshToken: string;
  requiresOtp?: never;
}

export interface OtpRequiredResponse {
  requiresOtp: true;
  phone: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    offset: number;
  };
}

export interface DashboardStats {
  activeAlerts: number;
  totalUsers: number;
  totalLgas: number;
  activePatrols: number;
  activeSosSignals: number;
  openIncidents: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
