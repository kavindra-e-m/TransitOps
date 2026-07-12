import React from 'react';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Premium KPI Card
 * Props:
 *  label        — metric title
 *  value        — number or string
 *  prefix/suffix — e.g. "$" / "%"
 *  icon         — lucide icon component
 *  color        — "amber" | "green" | "blue" | "orange" | "red" | "muted"
 *  trend        — number (positive = up, negative = down, 0 = flat)
 *  trendLabel   — e.g. "Active on road"
 */

const COLOR_MAP = {
  amber:  { icon: 'rgba(255,193,116,0.15)', iconText: '#ffc174',  topBar: 'linear-gradient(90deg,#ffc174,#f59e0b)', glow: 'rgba(255,193,116,0.12)' },
  green:  { icon: 'rgba(81,231,123,0.12)',  iconText: '#51e77b',  topBar: 'linear-gradient(90deg,#51e77b,#22c55e)', glow: 'rgba(81,231,123,0.10)' },
  blue:   { icon: 'rgba(173,198,255,0.12)', iconText: '#adc6ff',  topBar: 'linear-gradient(90deg,#adc6ff,#60a5fa)', glow: 'rgba(173,198,255,0.10)' },
  orange: { icon: 'rgba(249,115,22,0.12)',  iconText: '#f97316',  topBar: 'linear-gradient(90deg,#f97316,#ea580c)', glow: 'rgba(249,115,22,0.10)' },
  red:    { icon: 'rgba(255,180,171,0.12)', iconText: '#ffb4ab',  topBar: 'linear-gradient(90deg,#ffb4ab,#ef4444)', glow: 'rgba(255,180,171,0.10)' },
  muted:  { icon: 'rgba(92,104,128,0.12)',  iconText: '#5c6880',  topBar: 'linear-gradient(90deg,#5c6880,#374151)', glow: 'rgba(92,104,128,0.08)' },
};

const KPICard = ({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  color = 'amber',
  trend = 0,
  trendLabel = '',
}) => {
  const c = COLOR_MAP[color] || COLOR_MAP.amber;
  const isNumeric = typeof value === 'number';

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? '#51e77b' : trend < 0 ? '#ffb4ab' : '#5c6880';

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-default select-none group kpi-card-hover"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: c.topBar }}
      />

      {/* Subtle glow in background */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
      />

      <div className="relative p-5 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          {Icon && (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: c.icon }}
            >
              <Icon size={15} style={{ color: c.iconText }} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="kpi-value-custom" style={{ color: 'var(--text-primary)' }}>
          {prefix && <span className="text-lg font-sans mr-0.5" style={{ color: 'var(--text-secondary)' }}>{prefix}</span>}
          {isNumeric ? (
            <CountUp
              start={0}
              end={value}
              duration={0.9}
              separator=","
              decimals={value % 1 !== 0 ? 1 : 0}
            />
          ) : (
            <span>{value}</span>
          )}
          {suffix && <span className="text-sm font-sans ml-1" style={{ color: 'var(--text-secondary)' }}>{suffix}</span>}
        </div>

        {/* Trend row */}
        {trendLabel && (
          <div className="flex items-center gap-1.5">
            <TrendIcon size={13} style={{ color: trendColor }} />
            <span className="text-[11px] font-medium" style={{ color: trendColor }}>
              {trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
export { KPICard };
