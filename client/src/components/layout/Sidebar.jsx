import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart2, Settings, HelpCircle, AlertOctagon, Map, Lock, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPermission } from '../../config/permissions';

const NAV = [
  { to: '/dashboard',    label: 'Fleet Overview',   icon: LayoutDashboard, module: 'dashboard'    },
  { to: '/map',          label: 'Fleet Map',         icon: Map,             module: null           }, // always visible
  { to: '/fleet',        label: 'Fleet Registry',    icon: Truck,           module: 'fleet'        },
  { to: '/drivers',      label: 'Drivers Registry',  icon: Users,           module: 'drivers'      },
  { to: '/trips',        label: 'Route Optimizer',   icon: Route,           module: 'trips'        },
  { to: '/maintenance',  label: 'Maintenance Logs',  icon: Wrench,          module: 'maintenance'  },
  { to: '/fuel-expenses',label: 'Fuel & Expenses',   icon: Fuel,            module: 'fuelExpenses' },
  { to: '/analytics',    label: 'Fleet Analytics',   icon: BarChart2,       module: 'analytics'    },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'JD';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Filter out nav items where the role has 'none' permission
  const visibleNav = NAV.filter(item => {
    if (!item.module) return true; // null module = always visible (e.g. Map)
    return getPermission(role, item.module) !== 'none';
  });

  return (
    <aside className="fixed top-0 left-0 h-full w-[240px] bg-sidebar border-r border-outline-variant flex flex-col z-[60]">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3">
        <img 
          alt="TransitOps Logo" 
          className="w-8 h-8 rounded-md" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVWo1E-XmdfebLTGT4eFIFv3DkjyScGoQbMd2_O0tgsdCu1GKSRf9L7QhVzRhf9w1tpAOPR8SLdh80nx80bBKm4gy97bTvtoO0Fw0YFXO1DsHDalMnxbV-CqZ8meDvM_rbfyHi9r4vpyCRN1aSfSx-3IUAzWkB5EISuCjyTZMpfKbcD7bA15Br4Am-ycxP4eC7IYrU0zmeRBh0-08XeIh-i_HweQ0Q4qjkOuyziUND2scN5gmi4yaJ4uRCuofyrUBNNyaR9PnBiUxp"
        />
        <div className="flex flex-col select-none">
          <span className="text-lg font-bold text-accent tracking-tight leading-none">TransitOps</span>
          <span className="text-[9px] uppercase tracking-widest text-secondary font-extrabold mt-0.5">Command Center</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {visibleNav.map(({ to, label, icon: Icon, module }) => {
          const active = pathname === to;
          const permLevel = module ? getPermission(role, module) : 'edit';
          const isViewOnly = permLevel === 'view';
          return (
            <NavLink 
              key={to} 
              to={to} 
              className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 group active:scale-[0.98]"
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,193,116,0.06)' : 'transparent',
              })}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon 
                size={16} 
                className={active ? 'text-accent' : 'text-secondary group-hover:text-primary transition-colors'} 
              />
              <span className="font-medium capitalize flex-1">{label}</span>
              {/* Lock icon for view-only modules */}
              {isViewOnly && (
                <Lock size={10} className="text-muted/60 shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Dispatch Action */}
      <div className="p-3 mt-auto">
        <button 
          onClick={() => alert("Dispatch alert triggers manual priority routing alerts.")}
          className="w-full bg-accent text-[#0B0E14] font-bold py-3 rounded-lg flex items-center justify-center gap-2 glow-amber hover:brightness-110 active:scale-95 transition-all text-xs tracking-wider uppercase"
        >
          <AlertOctagon size={15} />
          Dispatch Alert
        </button>
      </div>

      {/* Footer Nav & Signature */}
      <div className="border-t border-outline-variant/30 py-3 space-y-1">
        <NavLink 
          to="/settings" 
          className="flex items-center gap-3 px-7 py-2.5 text-xs text-secondary hover:text-primary transition-colors uppercase font-semibold"
        >
          <Settings size={15} />
          Settings
        </NavLink>
        <div 
          onClick={() => alert("Contact support at support@transitops.com")} 
          className="flex items-center gap-3 px-7 py-2.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer uppercase font-semibold"
        >
          <HelpCircle size={15} />
          Support
        </div>

        {/* User Signature + Logout */}
        <div className="mt-4 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center gap-3 px-4 select-none">
            <div className="w-8 h-8 rounded-full bg-card border border-accent/20 flex items-center justify-center text-accent text-xs font-bold font-mono shrink-0">
              {initials}
            </div>
            <div className="flex flex-col leading-tight flex-1 min-w-0">
              <span className="text-xs font-bold text-primary truncate">{user?.name || 'Dispatcher'}</span>
              <span className="text-[10px] text-secondary font-medium truncate">{role || 'Operations'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="ml-auto shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-status-retired hover:bg-status-retired/10 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
