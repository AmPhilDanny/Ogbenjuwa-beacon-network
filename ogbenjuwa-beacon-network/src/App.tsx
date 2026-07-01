import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AlertProvider } from './contexts/AlertContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useWebSocket } from './hooks/useWebSocket';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Feed = lazy(() => import('./pages/Feed'));
const Report = lazy(() => import('./pages/Report'));
const Resources = lazy(() => import('./pages/Resources'));
const Neighborhood = lazy(() => import('./pages/Neighborhood'));
const Profile = lazy(() => import('./pages/Profile'));
const Patrol = lazy(() => import('./pages/Patrol'));
const AlertPage = lazy(() => import('./pages/Alert'));
const Reunify = lazy(() => import('./pages/Reunify'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Landing = lazy(() => import('./pages/Landing'));

const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function App() {
  useWebSocket();
  return (
    <BrowserRouter>
      <AlertProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public — landing + login */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected — require auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/report" element={<Report />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/alert" element={<AlertPage />} />
                <Route path="/reunify" element={<Reunify />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patrol" element={<Patrol />} />
                <Route path="/neighborhood" element={<Neighborhood />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all — redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;
