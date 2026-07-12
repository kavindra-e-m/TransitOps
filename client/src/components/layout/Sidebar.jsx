import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart2, Settings
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-sidebar border-r border-default flex flex-col z-30">
      <div className="px-5 py-5 border-b border-default">
        <span className="text-accent font-bold text-lg tracking-tight font-mono">TransitOps</span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <NavLink key={to} to={to} className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group"
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(245,158,11,0.07)' : 'transparent',
              })}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon size={16} className={active ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary transition-colors'} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
