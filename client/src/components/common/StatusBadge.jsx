import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  
  const s = status.toLowerCase().trim();
  
  let config = {
    bg: 'bg-status-draft/15',
    text: 'text-status-draft',
    border: 'border-status-draft/30',
    pulse: false
  };

  if (s === 'available') {
    config = {
      bg: 'bg-[#22C55E]/15',
      text: 'text-[#22C55E]',
      border: 'border-[#22C55E]/30',
      pulse: false
    };
  } else if (s === 'on trip' || s === 'dispatched' || s === 'active') {
    config = {
      bg: 'bg-[#3B82F6]/15',
      text: 'text-[#3B82F6]',
      border: 'border-[#3B82F6]/30',
      pulse: true
    };
  } else if (s === 'in shop' || s === 'shop') {
    config = {
      bg: 'bg-[#F97316]/15',
      text: 'text-[#F97316]',
      border: 'border-[#F97316]/30',
      pulse: false
    };
  } else if (s === 'retired' || s === 'suspended' || s === 'cancelled' || s === 'expired') {
    config = {
      bg: 'bg-[#EF4444]/15',
      text: 'text-[#EF4444]',
      border: 'border-[#EF4444]/30',
      pulse: false
    };
  } else if (s === 'draft' || s === 'off duty' || s === 'closed') {
    config = {
      bg: 'bg-[#6B7280]/15',
      text: 'text-[#6B7280]',
      border: 'border-[#6B7280]/30',
      pulse: false
    };
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold select-none border ${config.bg} ${config.text} ${config.border} ${config.pulse ? 'pulse-animation' : ''}`}
    >
      {config.pulse && (
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
export { StatusBadge };
