import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Truck, Users, Navigation, Wrench, Receipt } from 'lucide-react';

import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';

const menuItems = [
  { path: '/fleet', label: 'Fleet Registry', icon: Truck },
  { path: '/drivers', label: 'Drivers & Safety', icon: Users },
  { path: '/trips', label: 'Trip Dispatcher', icon: Navigation },
  { path: '/maintenance', label: 'Maintenance Log', icon: Wrench },
  { path: '/expenses', label: 'Expenses & Fuel', icon: Receipt },
];

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-primary text-text-primary overflow-hidden font-sans">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#131826',
            color: '#F9FAFB',
            border: '1px solid #1F2937',
            fontFamily: 'Inter, sans-serif'
          }
        }} 
      />

      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-default flex flex-col z-20 select-none">
        <div className="p-6 border-b border-default flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[#0B0E14] font-bold text-lg shadow-md shadow-accent/10">
            TO
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm">TransitOps</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Fleet Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block">
                <div
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 group
                    ${isActive 
                      ? 'text-accent bg-accent/5' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
                    }
                  `}
                >
                  {/* Left indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary transition-colors'} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-default text-[10px] text-text-muted space-y-0.5">
          <p className="font-semibold text-text-secondary">TransitOps Management Console</p>
          <p>© 2026 Fleet Operations Corp.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-default px-8 flex items-center justify-between select-none">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            {menuItems.find(item => item.path === location.pathname)?.label || 'System Console'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">System Live</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/fleet" replace />} />
              <Route path="/fleet" element={<PageWrapper><Fleet /></PageWrapper>} />
              <Route path="/drivers" element={<PageWrapper><Drivers /></PageWrapper>} />
              <Route path="/trips" element={<PageWrapper><Trips /></PageWrapper>} />
              <Route path="/maintenance" element={<PageWrapper><Maintenance /></PageWrapper>} />
              <Route path="/expenses" element={<PageWrapper><FuelExpenses /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
export { App };
