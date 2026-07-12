import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Moon, Sun, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/* Friendly page name map */
const PAGE_NAMES = {
  '/dashboard':     'Fleet Overview',
  '/map':           'Fleet Map',
  '/fleet':         'Fleet Registry',
  '/drivers':       'Drivers Registry',
  '/trips':         'Route Optimizer',
  '/maintenance':   'Maintenance',
  '/fuel-expenses': 'Fuel & Expenses',
  '/analytics':     'Fleet Analytics',
  '/settings':      'Settings',
};

const Topbar = () => {
  const { user, role } = useAuth();
  const { pathname } = useLocation();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info',    title: 'TRK-892 Dispatch Nominal',     message: 'En route to destination on time.',        time: '2m ago',  read: false },
    { id: 2, type: 'warning', title: 'Maintenance Warning',           message: 'VAN-05 requires service inspection soon.', time: '15m ago', read: false },
    { id: 3, type: 'success', title: 'Telemetry Sync Complete',       message: 'System synced with Terminal L-01.',        time: '1h ago',  read: true  },
  ]);

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TO';
  const pageName = PAGE_NAMES[pathname] || 'TransitOps';

  const handleOpenNotifications = () => {
    setShowNotifications(v => !v);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const typeColor = { info: '#adc6ff', warning: '#ffc174', success: '#51e77b' };
  const typeDot   = { info: '#adc6ff', warning: '#ffc174', success: '#51e77b' };

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-6 z-50"
      style={{
        left: 252,
        background: 'rgba(11,14,20,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 select-none">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>TransitOps</span>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{pageName}</span>

        {/* Live dot */}
        <div className="flex items-center gap-1.5 ml-3 px-2 py-1 rounded-full" style={{ background: 'rgba(81,231,123,0.08)', border: '1px solid rgba(81,231,123,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#51e77b', boxShadow: '0 0 5px rgba(81,231,123,0.8)', animation: 'status-pulse 2s infinite' }} />
          <span className="text-[10px] font-bold" style={{ color: '#51e77b' }}>Live</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="relative w-64 group mx-6">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search fleet, routes, drivers..."
          className="w-full rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(255,193,116,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid var(--border-default)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,193,116,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,193,116,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            title="Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: 'var(--status-retired)', boxShadow: '0 0 6px rgba(255,180,171,0.7)' }}
              />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #1a1f2a, #141820)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-semibold transition-colors"
                        style={{ color: 'var(--accent)' }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className="flex gap-3 px-3 py-3 rounded-xl transition-colors"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.055)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <div className="mt-0.5 shrink-0">
                          <span className="w-2 h-2 rounded-full block" style={{ background: typeDot[n.type] || '#5c6880', boxShadow: `0 0 6px ${typeDot[n.type] || '#5c6880'}` }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold leading-tight" style={{ color: typeColor[n.type] || 'var(--text-primary)' }}>{n.title}</span>
                            <span className="text-[9px] shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                          <p className="text-[11px] mt-0.5 leading-normal" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                        No new notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-default)' }} />

        {/* User */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none group pl-1">
          <div className="text-right leading-tight">
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Operator'}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{role}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold"
            style={{
              background: 'linear-gradient(135deg, rgba(255,193,116,0.25), rgba(173,198,255,0.15))',
              border: '1.5px solid rgba(255,193,116,0.3)',
              color: 'var(--accent)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
