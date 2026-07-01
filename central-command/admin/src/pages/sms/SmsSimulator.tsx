import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { Phone, MessageSquare, Radio, Send, RotateCw, CheckCircle2, XCircle, Clock, Smartphone } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface SmsLog {
  id: string;
  alertId: string | null;
  recipientPhone: string;
  recipientName: string | null;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  deliveredAt: string | null;
}

interface SimulateResponse {
  mode: 'sms' | 'ussd';
  delivered?: number;
  failed?: number;
  total?: number;
  logs: SmsLog[];
  sessionId?: string;
  message?: string;
  step?: number;
}

// ─── USSD Steps ───────────────────────────────────────────────────────────

const USSD_STEPS = [
  {
    title: 'OGBENJUWA USSD',
    lines: [
      '1. Ufele (Attack)',
      '2. Ole (Fire)',
      '3. Ochere (Medical)',
      '4. Ofa (Abduction)',
      '5. Obu Ofu (Other)',
      '',
      'Send 1-5 or type:',
    ],
  },
  {
    title: 'Select Alert Type',
    lines: [
      'Selected: Ufele (Attack)',
      '',
      '1. Confirm',
      '2. Cancel',
      '3. Change type',
      '',
      'Send 1-3 or type:',
    ],
  },
  {
    title: 'Confirm Location',
    lines: [
      'Village: Otukpo',
      'LGA: Otukpo',
      '',
      '1. Confirm & Send',
      '2. Change location',
      '3. Cancel alert',
      '',
      'Send 1-3 or type:',
    ],
  },
  {
    title: 'ALERT SENT',
    lines: [
      '✓ Warriors notified',
      '✓ SMS broadcast active',
      '✓ Patrols dispatched',
      '',
      'Stay safe. Ogbenjuwa.',
      '',
      'End of session.',
    ],
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    sent: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
  };
  const icons: Record<string, React.ReactNode> = {
    delivered: <CheckCircle2 className="w-3 h-3" />,
    sent: <Clock className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {icons[status] || null}
      {status}
    </span>
  );
}

// ─── Phone Shell ──────────────────────────────────────────────────────────

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[220px] bg-white rounded-[28px] border-4 border-gray-300 shadow-lg overflow-hidden">
      <div className="bg-gray-800 h-6 flex items-center justify-center">
        <div className="w-16 h-1.5 bg-gray-600 rounded-full" />
      </div>
      <div className="bg-[#f5f5f0] p-3 font-mono text-xs leading-relaxed min-h-[280px]">
        {children}
      </div>
      <div className="bg-gray-800 h-8 flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-gray-600" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function SmsSimulator() {
  // Compose form
  const [mode, setMode] = useState<'sms' | 'ussd'>('sms');
  const [message, setMessage] = useState('OGBENJUWA ALERT: Please remain vigilant. Report suspicious activity to *347#');
  const [phoneInput, setPhoneInput] = useState('+2348034412290, +2348123456789');

  // Simulation
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // USSD
  const [ussdStep, setUssdStep] = useState(0);
  const [ussdAutoCycle, setUssdAutoCycle] = useState(false);

  // Logs
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ── Fetch logs ────────────────────────────────────────────────────────

  const fetchLogs = async (page = 1, append = false) => {
    setLogsLoading(true);
    try {
      const res = await api.get<{ data: SmsLog[] }>(`/sms/logs?page=${page}&limit=20`);
      if (append) {
        setLogs(prev => [...prev, ...res.data]);
      } else {
        setLogs(res.data);
      }
      setHasMore(res.data.length === 20);
      setLogPage(page);
    } catch {
      setError('Failed to fetch SMS logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  // ── USSD auto-cycle ───────────────────────────────────────────────────

  useEffect(() => {
    if (!ussdAutoCycle) return;
    const interval = setInterval(() => {
      setUssdStep(s => (s + 1) % USSD_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [ussdAutoCycle]);

  // ── Simulate ──────────────────────────────────────────────────────────

  const handleSimulate = async () => {
    setSimulating(true);
    setError(null);
    setResult(null);

    const phones = phoneInput
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    if (phones.length === 0) {
      setError('Enter at least one phone number');
      setSimulating(false);
      return;
    }

    if (mode === 'ussd') {
      setUssdAutoCycle(true);
      setUssdStep(0);
    }

    try {
      const res = await api.post<SimulateResponse>('/sms/simulate', {
        mode,
        message: message || undefined,
        recipientPhones: phones.length > 0 ? phones : undefined,
      });
      setResult(res);
      fetchLogs(1); // Refresh logs
    } catch (err: any) {
      setError(err?.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">SMS / USSD Simulator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Simulate emergency broadcasts and manage SMS logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT: Compose ─────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Compose Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4" /> Compose Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('sms')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'sms'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> SMS
                </button>
                <button
                  onClick={() => setMode('ussd')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'ussd'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Radio className="w-4 h-4" /> USSD
                </button>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your alert message..."
                />
              </div>

              {/* Recipient phones */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Recipient Phones</label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="+234803XXXXXXX, +234812XXXXXXX"
                />
                <p className="text-[10px] text-muted-foreground">Comma-separated phone numbers. Uses defaults if empty.</p>
              </div>

              {/* Simulate button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSimulate}
                disabled={simulating}
              >
                {simulating ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {mode === 'sms' ? 'Simulate SMS Broadcast' : 'Simulate USSD Session'}
                  </>
                )}
              </Button>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && mode === 'sms' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Broadcast Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-700">{result.delivered ?? 0}</p>
                    <p className="text-[10px] text-green-600">Delivered</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50">
                    <p className="text-2xl font-bold text-red-700">{result.failed ?? 0}</p>
                    <p className="text-[10px] text-red-600">Failed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-700">{result.total ?? 0}</p>
                    <p className="text-[10px] text-blue-600">Total</p>
                  </div>
                </div>

                {/* Recent log entries */}
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {result.logs?.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <span className="font-mono">{log.recipientPhone}</span>
                      <StatusBadge status={log.status} />
                    </div>
                  ))}
                  {result.logs && result.logs.length > 10 && (
                    <p className="text-[10px] text-muted-foreground text-center pt-1">
                      +{result.logs.length - 10} more (see logs below)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* USSD Response Display */}
          {mode === 'ussd' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> USSD Response
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PhoneShell>
                  <div className="text-center font-bold text-gray-800 text-xs mb-2">
                    {USSD_STEPS[ussdStep].title}
                  </div>
                  {USSD_STEPS[ussdStep].lines.map((line, i) => (
                    <div key={i} className="text-gray-700">
                      {line || '\u00A0'}
                    </div>
                  ))}
                  <div className="mt-3 text-gray-500">
                    &gt; <span className="animate-pulse">▌</span>
                  </div>
                  {ussdAutoCycle && (
                    <p className="text-[9px] text-green-600 mt-2 text-center animate-pulse">
                      Session active — auto-cycling steps
                    </p>
                  )}
                </PhoneShell>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── RIGHT: SMS Logs ────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> SMS Logs
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(1)}
                disabled={logsLoading}
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No SMS logs yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Run a simulation to see logs here</p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                <span className="font-mono text-xs">{log.recipientPhone}</span>
                              </div>
                              {log.recipientName && (
                                <span className="text-[10px] text-muted-foreground ml-5">{log.recipientName}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 max-w-[240px]">
                              <p className="text-xs truncate">{log.message}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <StatusBadge status={log.status} />
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.sentAt).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="px-4 py-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => fetchLogs(logPage + 1, true)}
                        disabled={logsLoading}
                      >
                        {logsLoading ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="px-4 py-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground flex items-center gap-4">
                    <span>Total: {logs.length}+</span>
                    <span>Delivered: {logs.filter(l => l.status === 'delivered').length}</span>
                    <span>Failed: {logs.filter(l => l.status === 'failed').length}</span>
                    <span>Pending: {logs.filter(l => l.status === 'sent').length}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
