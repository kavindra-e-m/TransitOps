import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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

const App = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/fleet" element={<Protected><Fleet /></Protected>} />
        <Route path="/drivers" element={<Protected><Drivers /></Protected>} />
        <Route path="/trips" element={<Protected><Trips /></Protected>} />
        <Route path="/maintenance" element={<Protected><Maintenance /></Protected>} />
        <Route path="/fuel-expenses" element={<Protected><FuelExpenses /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
