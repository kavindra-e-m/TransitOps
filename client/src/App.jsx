import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ShieldOff } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { getPermission } from './config/permissions';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import PageWrapper from './components/layout/PageWrapper';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import FleetMap from './pages/FleetMap';

const AppShell = ({ children }) => (
  <div className="flex min-h-screen bg-primary bg-dot-grid">
    <Sidebar />
    <div className="flex-1 flex flex-col" style={{ marginLeft: 252 }}>
      <Topbar />
      <main className="flex-1 mt-14">
        {children}
      </main>
    </div>
  </div>
);

const Protected = ({ children }) => (
  <ProtectedRoute>
    <AppShell>
      <PageWrapper>{children}</PageWrapper>
    </AppShell>
  </ProtectedRoute>
);

/**
 * RoleRoute — wraps a page and checks if the current user's role has
 * any access (view or edit) to that module. If permission is 'none',
 * renders a clean "Access Restricted" card instead of the real page.
 */
const RoleRoute = ({ children, module }) => {
  const { role } = useAuth();
  const level = getPermission(role, module);

  if (level === 'none') {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center select-none px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-status-retired/10 border border-status-retired/20 flex items-center justify-center">
            <ShieldOff size={28} className="text-status-retired" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary">Access Restricted</p>
            <p className="text-xs text-secondary leading-relaxed">
              Your role (<span className="font-semibold text-accent">{role}</span>) doesn't have access to this module.
              Contact your Fleet Manager if you believe this is an error.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full border border-status-retired/30 bg-status-retired/5 text-[10px] font-bold uppercase tracking-wider text-status-retired">
            Permission: {level}
          </div>
        </div>
      </div>
    );
  }
  return children;
};

const App = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<Protected><RoleRoute module="dashboard"><Dashboard /></RoleRoute></Protected>} />
        <Route path="/fleet" element={<Protected><RoleRoute module="fleet"><Fleet /></RoleRoute></Protected>} />
        <Route path="/map" element={<Protected><FleetMap /></Protected>} />
        <Route path="/drivers" element={<Protected><RoleRoute module="drivers"><Drivers /></RoleRoute></Protected>} />
        <Route path="/trips" element={<Protected><RoleRoute module="trips"><Trips /></RoleRoute></Protected>} />
        <Route path="/maintenance" element={<Protected><RoleRoute module="maintenance"><Maintenance /></RoleRoute></Protected>} />
        <Route path="/fuel-expenses" element={<Protected><RoleRoute module="fuelExpenses"><FuelExpenses /></RoleRoute></Protected>} />
        <Route path="/analytics" element={<Protected><RoleRoute module="analytics"><Analytics /></RoleRoute></Protected>} />
        <Route path="/settings" element={<Protected><RoleRoute module="settings"><Settings /></RoleRoute></Protected>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
