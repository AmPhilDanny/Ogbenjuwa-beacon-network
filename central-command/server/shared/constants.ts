export const ROLES = ['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader', 'community_admin', 'resident'] as const;

export type Role = typeof ROLES[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  state_observer: 80,
  lga_coordinator: 60,
  vigilante_leader: 40,
  community_admin: 20,
  resident: 10,
};

export const SEVERITY = ['critical', 'high', 'medium', 'low'] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
};

export const ALERT_STATUSES = ['active', 'investigating', 'resolved', 'false_alarm'] as const;

export const INCIDENT_STATUSES = ['reported', 'investigating', 'resolved', 'closed'] as const;

export const PATROL_STATUSES = ['scheduled', 'active', 'completed', 'cancelled'] as const;

export const LGA_LIST = [
  { code: 'ADO', name: 'Ado' },
  { code: 'AGAT', name: 'Agatu' },
  { code: 'APA', name: 'Apa' },
  { code: 'BUR', name: 'Buruku' },
  { code: 'GBN', name: 'Gboko' },
  { code: 'GMA', name: 'Guma' },
  { code: 'GWE', name: 'Gwer East' },
  { code: 'GWW', name: 'Gwer West' },
  { code: 'KSH', name: 'Katsina-Ala' },
  { code: 'KON', name: 'Konshisha' },
  { code: 'KWP', name: 'Kwande' },
  { code: 'LOG', name: 'Logo' },
  { code: 'MKD', name: 'Makurdi' },
  { code: 'OBI', name: 'Obi' },
  { code: 'OGB', name: 'Ogbadibo' },
  { code: 'OJU', name: 'Ohimini' },
  { code: 'OJO', name: 'Oju' },
  { code: 'OKP', name: 'Okpokwu' },
  { code: 'OTU', name: 'Otukpo' },
  { code: 'TSH', name: 'Tarka' },
  { code: 'UKM', name: 'Ukum' },
  { code: 'USH', name: 'Ushongo' },
  { code: 'VAN', name: 'Vandeikya' },
] as const;
