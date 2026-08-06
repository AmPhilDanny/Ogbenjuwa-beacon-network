import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserList = lazy(() => import('./pages/users/UserList'));
const UserForm = lazy(() => import('./pages/users/UserForm'));
const UserDetail = lazy(() => import('./pages/users/UserDetail'));
const LgaList = lazy(() => import('./pages/lgas/LgaList'));
const LgaDetail = lazy(() => import('./pages/lgas/LgaDetail'));
const AlertList = lazy(() => import('./pages/alerts/AlertList'));
const AlertForm = lazy(() => import('./pages/alerts/AlertForm'));
const AlertDetail = lazy(() => import('./pages/alerts/AlertDetail'));
const IncidentList = lazy(() => import('./pages/incidents/IncidentList'));
const IncidentDetail = lazy(() => import('./pages/incidents/IncidentDetail'));
const PatrolList = lazy(() => import('./pages/patrols/PatrolList'));
const PatrolForm = lazy(() => import('./pages/patrols/PatrolForm'));
const PatrolDetail = lazy(() => import('./pages/patrols/PatrolDetail'));
const Communications = lazy(() => import('./pages/communications/Communications'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const ApiKeys = lazy(() => import('./pages/ApiKeys'));
const SiteSettings = lazy(() => import('./pages/settings/SiteSettings'));
const SmsSimulator = lazy(() => import('./pages/sms/SmsSimulator'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));
const RolesPage = lazy(() => import('./pages/roles/RolesPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="users/:id/edit" element={<UserForm />} />
              <Route path="lgas" element={<LgaList />} />
              <Route path="lgas/:id" element={<LgaDetail />} />
              <Route path="alerts" element={<AlertList />} />
              <Route path="alerts/new" element={<AlertForm />} />
              <Route path="alerts/:id" element={<AlertDetail />} />
              <Route path="alerts/:id/edit" element={<AlertForm />} />
              <Route path="incidents" element={<IncidentList />} />
              <Route path="incidents/:id" element={<IncidentDetail />} />
              <Route path="patrols" element={<PatrolList />} />
              <Route path="patrols/new" element={<PatrolForm />} />
              <Route path="patrols/:id" element={<PatrolDetail />} />
              <Route path="patrols/:id/edit" element={<PatrolForm />} />
              <Route path="communications" element={<Communications />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="audit-logs" element={<AuditLog />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="notifications" element={<NotificationPreferences />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="sms" element={<SmsSimulator />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
