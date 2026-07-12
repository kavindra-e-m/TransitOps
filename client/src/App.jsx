import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ShieldOff } from 'lucide-react';
import { useAuth } from './context/AuthContext';
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
  <div className="flex min-h-screen bg-primary">
    <Sidebar />
    <div className="flex-1 ml-60 flex flex-col">
      <Topbar />
      <main className="flex-1 mt-16">
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

const RoleRoute = ({ children, allowed }) => {
  const { role } = useAuth();
  if (!allowed.includes(role)) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldOff size={36} className="text-status-retired" />
          <p className="text-sm font-semibold text-primary">Access Restricted</p>
          <p className="text-xs text-muted max-w-xs">
            This module requires additional privileges. Review settings to view authorization matrix.
          </p>
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
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/fleet" element={<Protected><Fleet /></Protected>} />
        <Route path="/map" element={<Protected><FleetMap /></Protected>} />
        <Route path="/drivers" element={<Protected><RoleRoute allowed={['Fleet Manager', 'Dispatcher', 'Safety Officer']}><Drivers /></RoleRoute></Protected>} />
        <Route path="/trips" element={<Protected><RoleRoute allowed={['Fleet Manager', 'Dispatcher']}><Trips /></RoleRoute></Protected>} />
        <Route path="/maintenance" element={<Protected><RoleRoute allowed={['Fleet Manager', 'Safety Officer']}><Maintenance /></RoleRoute></Protected>} />
        <Route path="/fuel-expenses" element={<Protected><RoleRoute allowed={['Fleet Manager', 'Financial Analyst']}><FuelExpenses /></RoleRoute></Protected>} />
        <Route path="/analytics" element={<Protected><RoleRoute allowed={['Fleet Manager', 'Financial Analyst']}><Analytics /></RoleRoute></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
