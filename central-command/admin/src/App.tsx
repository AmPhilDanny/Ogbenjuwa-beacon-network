import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import UserDetail from './pages/users/UserDetail';
import LgaList from './pages/lgas/LgaList';
import LgaDetail from './pages/lgas/LgaDetail';
import AlertList from './pages/alerts/AlertList';
import AlertForm from './pages/alerts/AlertForm';
import AlertDetail from './pages/alerts/AlertDetail';
import IncidentList from './pages/incidents/IncidentList';
import IncidentDetail from './pages/incidents/IncidentDetail';
import PatrolList from './pages/patrols/PatrolList';
import Communications from './pages/communications/Communications';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import ApiKeys from './pages/ApiKeys';
import SiteSettings from './pages/settings/SiteSettings';
import SmsSimulator from './pages/sms/SmsSimulator';
import NotificationPreferences from './pages/NotificationPreferences';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="lgas" element={<LgaList />} />
            <Route path="lgas/:id" element={<LgaDetail />} />
            <Route path="alerts" element={<AlertList />} />
            <Route path="alerts/new" element={<AlertForm />} />
            <Route path="alerts/:id" element={<AlertDetail />} />
            <Route path="incidents" element={<IncidentList />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="patrols" element={<PatrolList />} />
            <Route path="communications" element={<Communications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit-logs" element={<AuditLog />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="notifications" element={<NotificationPreferences />} />
            <Route path="sms" element={<SmsSimulator />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
