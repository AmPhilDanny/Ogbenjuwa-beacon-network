import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
  mapping?: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }>;
}

const defaultMapping: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'default' },
  investigating: { label: 'Investigating', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'default' },
  false_alarm: { label: 'False Alarm', variant: 'warning' },
  reported: { label: 'Reported', variant: 'info' },
  closed: { label: 'Closed', variant: 'default' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  submitted: { label: 'Submitted', variant: 'default' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  actioned: { label: 'Actioned', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  responding: { label: 'Responding', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
};

export default function StatusBadge({ status, mapping }: StatusBadgeProps) {
  const merged = { ...defaultMapping, ...mapping };
  const config = merged[status] || { label: status, variant: 'default' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
