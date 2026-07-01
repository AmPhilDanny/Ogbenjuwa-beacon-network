import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { WifiOff, RefreshCw, Inbox } from 'lucide-react';
import { ThemeProvider } from '@/lib/theme';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import ProtectedRoute from '@/auth/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/auth/Login';
import VigilanteDashboard from '@/dashboards/vigilante/VigilanteDashboard';
import CommunityDashboard from '@/dashboards/community/CommunityDashboard';
import DirectoryPage from '@/directory/DirectoryPage';
import ReportPage from '@/report/ReportPage';
import ProfilePage from '@/profile/ProfilePage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

function OfflineBanner() {
  const { t } = useLanguage();
  const { online, queueCount, flush } = useNetworkStatus();
  const [flushing, setFlushing] = useState(false);

  const handleFlush = async () => {
    setFlushing(true);
    await flush();
    setFlushing(false);
  };

  if (online && queueCount > 0) {
    return (
      <div className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-sm',
        'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200',
      )}>
        <Inbox className="h-4 w-4" />
        <span>{queueCount} pending — syncing when online</span>
        <button onClick={handleFlush} disabled={flushing} className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800">
          <RefreshCw className={`h-3.5 w-3.5 ${flushing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-ogbenjuwa-amber px-4 py-2 text-sm text-white">
      <WifiOff className="h-4 w-4" />
      <span>{t('general.offline')} — {queueCount > 0 ? `${queueCount} pending` : 'showing cached'}</span>
    </div>
  );
}

function AppContent() {
  useWebSocket();
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/vigilante-dashboard" element={<VigilanteDashboard />} />
            <Route path="/community-dashboard" element={<CommunityDashboard />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/vigilante-dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <Toaster position="top-right" richColors closeButton />
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
