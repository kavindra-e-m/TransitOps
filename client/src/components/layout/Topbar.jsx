import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user, role } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="fixed top-0 right-0 h-16 w-[calc(100%-240px)] ml-[240px] bg-surface-container border-b border-outline-variant z-50 flex justify-between items-center px-6">
      {/* Title & Search bar */}
      <div className="flex items-center gap-6 flex-1">
        <span className="text-base font-extrabold text-accent tracking-tight select-none">
          TransitOps Central
        </span>
        <div className="relative w-full max-w-xs group">
          <Search 
            size={14} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" 
          />
          <input 
            type="text" 
            placeholder="Search fleet, routes, IDs..." 
            className="w-full bg-surface-container-lowest border border-outline-variant focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-md py-1.5 pl-10 pr-4 text-xs text-primary placeholder:text-secondary transition-all outline-none"
          />
        </div>
      </div>

      {/* Profile & Notifications Actions */}
      <div className="flex items-center gap-4">
        {/* Alerts Bell */}
        <button 
          onClick={() => alert("No new notifications")}
          className="p-2 text-secondary hover:text-accent transition-colors relative"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-retired rounded-full animate-ping"></span>
        </button>

        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-secondary hover:text-accent transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="text-right leading-tight">
            <p className="text-xs font-bold text-primary group-hover:text-accent transition-colors">
              {user?.name || 'Dispatcher'}
            </p>
            <p className="text-[10px] text-secondary">
              {role || 'North Sector'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full border border-accent/40 overflow-hidden bg-card flex items-center justify-center">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqmUk-c3sntYnN9ND0-cgpDAjizNPW4vmI6u_oGY_EZaJ34b8Di7a__VpxQ6xobl5JJrfwOaPE6IHi102MynSnYnyUl9ggi1ecys88odSg3MQT2O2R-L-9pQHS9H3mkFvdZOfOHKqzNCCZshuWEEKNSGTHINsDbIGcdrq1kaCDmhCCU40hivklU4N5h8or_4WIS21VtS7Bm0adHqPHJzHUaBIcmjZHSYiIlbmGgjCu6XuO5d4yiK-6bOwf6xjxdVJP2ywnrvmz1RsM" 
              alt="User profile"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
