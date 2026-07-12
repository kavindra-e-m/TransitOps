import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart2, Settings, HelpCircle, AlertOctagon, Map, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPermission } from '../../config/permissions';

const NAV_MAIN = [
  { to: '/dashboard',     label: 'Fleet Overview',    icon: LayoutDashboard, module: 'dashboard'    },
  { to: '/map',           label: 'Fleet Map',          icon: Map,             module: null           },
  { to: '/fleet',         label: 'Fleet Registry',     icon: Truck,           module: 'fleet'        },
  { to: '/drivers',       label: 'Drivers Registry',   icon: Users,           module: 'drivers'      },
  { to: '/trips',         label: 'Route Optimizer',    icon: Route,           module: 'trips'        },
];

const NAV_OPS = [
  { to: '/maintenance',   label: 'Maintenance',        icon: Wrench,          module: 'maintenance'  },
  { to: '/fuel-expenses', label: 'Fuel & Expenses',    icon: Fuel,            module: 'fuelExpenses' },
  { to: '/analytics',     label: 'Fleet Analytics',    icon: BarChart2,       module: 'analytics'    },
];

const NavItem = ({ to, label, icon: Icon, module, role }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  const permLevel = module ? getPermission(role, module) : 'edit';
  const isViewOnly = permLevel === 'view';

  return (
    <NavLink
      to={to}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-200 group"
      style={({ isActive }) => ({
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: isActive ? 'rgba(255,193,116,0.09)' : 'transparent',
      })}
    >
      {/* Active pill indicator */}
      {active && (
        <motion.span
          layoutId="sidebar-pill"
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: 'rgba(255,193,116,0.08)', border: '1px solid rgba(255,193,116,0.18)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}

      {/* Icon box */}
      <div
        className="relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          background: active ? 'rgba(255,193,116,0.15)' : 'rgba(255,255,255,0.04)',
        }}
      >
        <Icon
          size={14}
          style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
          className="group-hover:scale-110 transition-transform duration-150"
        />
      </div>

      <span className="relative z-10 flex-1 leading-none">{label}</span>

      {/* View-only badge */}
      {isViewOnly && (
        <span
          className="relative z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(92,104,128,0.15)', color: 'var(--text-muted)' }}
        >
          View
        </span>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TO';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filterNav = (items) =>
    items.filter(item => !item.module || getPermission(role, item.module) !== 'none');

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[252px] flex flex-col z-[60]"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 select-none">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #ffc174, #f59e0b)', boxShadow: '0 0 16px rgba(255,193,116,0.3)' }}
        >
          <Truck size={17} color="#0B0E14" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-[15px] tracking-tight" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
            TransitOps
          </span>
          <span className="text-[9px] uppercase tracking-[0.12em] mt-0.5 font-bold" style={{ color: 'var(--text-muted)' }}>
            Command Center
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mb-2" style={{ height: 1, background: 'var(--border-default)' }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">

        {/* Main section */}
        <div className="space-y-0.5">
          <p className="section-label px-3 pb-1.5">Navigation</p>
          {filterNav(NAV_MAIN).map(item => (
            <NavItem key={item.to} {...item} role={role} />
          ))}
        </div>

        {/* Operations section */}
        {filterNav(NAV_OPS).length > 0 && (
          <div className="space-y-0.5">
            <p className="section-label px-3 pb-1.5">Operations</p>
            {filterNav(NAV_OPS).map(item => (
              <NavItem key={item.to} {...item} role={role} />
            ))}
          </div>
        )}
      </nav>

      {/* ── Dispatch Alert CTA ── */}
      <div className="px-4 pb-3">
        <button
          onClick={() => alert('Dispatch alert triggers manual priority routing alerts.')}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 dispatch-pulse"
          style={{
            background: 'linear-gradient(135deg, #ffc174, #f59e0b)',
            color: '#0B0E14',
          }}
        >
          <AlertOctagon size={14} />
          Dispatch Alert
        </button>
      </div>

      {/* ── Bottom nav ── */}
      <div className="px-3 pb-2 space-y-0.5" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
          })}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Settings size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
          Settings
        </NavLink>
        <div
          onClick={() => alert('Contact support at support@transitops.com')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <HelpCircle size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
          Support
        </div>
      </div>

      {/* ── User card ── */}
      <div
        className="mx-3 mb-4 p-3 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)' }}
      >
        {/* Gradient initials avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,193,116,0.3), rgba(173,198,255,0.2))',
            border: '1.5px solid rgba(255,193,116,0.35)',
            color: 'var(--accent)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col leading-tight flex-1 min-w-0">
          <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Operator'}</span>
          <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{role || 'Fleet Ops'}</span>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,180,171,0.1)'; e.currentTarget.style.color = 'var(--status-retired)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
