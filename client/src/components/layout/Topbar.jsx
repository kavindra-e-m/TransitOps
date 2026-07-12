import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
  'Fleet Manager': 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
  'Dispatcher': 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
  'Safety Officer': 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30',
  'Financial Analyst': 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
};

const Topbar = () => {
  const { user, role } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-sidebar border-b border-default flex items-center px-6 gap-4 z-20">
      <div className="flex items-center gap-2 bg-input border border-default rounded-lg px-3 py-2 flex-1 max-w-xs">
        <Search size={14} className="text-text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none w-full"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        {role && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[role] || 'bg-status-draft/15 text-status-draft border-status-draft/30'}`}>
            {role}
          </span>
        )}
        <span className="text-sm text-text-primary font-medium">{user?.name}</span>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-[#0B0E14]">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
