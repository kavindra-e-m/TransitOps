import React from 'react';
import { CheckCircle, Circle, XCircle } from 'lucide-react';
import { getTripTimelineStages } from '../../utils/insights';

/**
 * TripTimeline — Feature 1
 * Vertical timeline showing trip lifecycle stages.
 * Reuses design tokens and pulse animation from StatusBadge.
 *
 * Props:
 *   trip — the trip object with at least a `status` field
 */
const TripTimeline = ({ trip }) => {
  const stages = getTripTimelineStages(trip);

  return (
    <div className="space-y-0 select-none">
      {stages.map(({ label, state }, i) => {
        const isLast = i === stages.length - 1;

        // Node visual config per state
        const nodeConfig = {
          completed: {
            icon: <CheckCircle size={16} className="text-[#51e77b] shrink-0" />,
            labelClass: 'text-[#51e77b] font-semibold',
            lineClass: 'bg-[#51e77b]/40',
            lineDashed: false,
          },
          active: {
            icon: (
              <span className="relative flex items-center justify-center shrink-0 w-4 h-4">
                {/* Outer pulsing ring */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#51e77b] opacity-30 animate-ping" />
                <span className="relative w-3 h-3 rounded-full bg-[#51e77b] border-2 border-[#51e77b]" />
              </span>
            ),
            labelClass: 'text-[#51e77b] font-bold',
            lineClass: 'bg-border-default',
            lineDashed: true,
          },
          future: {
            icon: <Circle size={16} className="text-muted shrink-0" />,
            labelClass: 'text-muted',
            lineClass: 'bg-border-default',
            lineDashed: true,
          },
          cancelled: {
            icon: <XCircle size={16} className="text-[#ffb4ab] shrink-0" />,
            labelClass: 'text-[#ffb4ab] font-semibold',
            lineClass: 'bg-[#ffb4ab]/30',
            lineDashed: false,
          },
        };

        const cfg = nodeConfig[state];

        return (
          <div key={label} className="flex gap-3">
            {/* Left column: node + connecting line */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                {cfg.icon}
              </div>
              {/* Connecting line (hidden on last item) */}
              {!isLast && (
                <div
                  className={`w-[2px] flex-1 min-h-[20px] mt-1 mb-0.5 ${cfg.lineClass} ${cfg.lineDashed ? 'opacity-40' : ''}`}
                  style={cfg.lineDashed ? { backgroundImage: 'repeating-linear-gradient(to bottom, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)' } : {}}
                />
              )}
            </div>

            {/* Right column: stage label + state chip */}
            <div className={`pb-4 flex items-start justify-between w-full gap-2 ${isLast ? '' : ''}`}>
              <span className={`text-xs leading-5 ${cfg.labelClass}`}>{label}</span>
              {state === 'active' && (
                <span className="text-[9px] bg-[#51e77b]/10 border border-[#51e77b]/20 text-[#51e77b] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                  In Progress
                </span>
              )}
              {state === 'cancelled' && (
                <span className="text-[9px] bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                  Cancelled
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TripTimeline;
export { TripTimeline };
