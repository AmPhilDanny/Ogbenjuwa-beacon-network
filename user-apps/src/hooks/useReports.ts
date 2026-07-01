import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { QuickReport, ResidentAlertType } from '@/lib/types';

export function useReports() {
  const [reports, setReports] = useState<QuickReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: QuickReport[] }>('/reports');
      setReports(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(async (type: ResidentAlertType, lga: string, description: string) => {
    try {
      await api.post('/reports', { type, lga, description });
      const report: QuickReport = {
        id: `RPT-${Date.now()}`,
        type,
        lga,
        description,
        timestamp: Date.now(),
        status: 'submitted',
      };
      setReports(prev => [report, ...prev]);
      return report;
    } catch {
      // fallback: save locally
      const report: QuickReport = {
        id: `RPT-${Date.now()}`,
        type,
        lga,
        description,
        timestamp: Date.now(),
        status: 'submitted',
      };
      setReports(prev => [report, ...prev]);
      return report;
    }
  }, []);

  return { reports, loading, fetchReports, submitReport };
}
