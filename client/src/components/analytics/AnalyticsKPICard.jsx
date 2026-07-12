import React from 'react';
import CountUp from 'react-countup';

// Color token map — mirrors the same colorMap used in common/KPICard.jsx
// so both components stay visually consistent across the project.
const COLOR_MAP = {
  blue:   { border: 'border-l-[#3B82F6]', icon: 'text-[#3B82F6]' },
  green:  { border: 'border-l-[#22C55E]', icon: 'text-[#22C55E]' },
  orange: { border: 'border-l-[#F97316]', icon: 'text-[#F97316]' },
  amber:  { border: 'border-l-[#F59E0B]', icon: 'text-[#F59E0B]' },
  red:    { border: 'border-l-[#EF4444]', icon: 'text-[#EF4444]' },
  gray:   { border: 'border-l-[#6B7280]', icon: 'text-[#6B7280]' },
};

/**
 * AnalyticsKPICard
 *
 * A specialized KPI card for the Analytics module.
 * Extends the visual pattern of common/KPICard with two additional slots:
 *   - icon  : a lucide-react icon displayed top-right
 *   - formula : an italic subtitle shown below the value
 *
 * Props:
 *   label   {string}          — uppercase label text (top-left)
 *   value   {number|string}   — main metric value
 *   icon    {ReactElement}    — lucide icon element, e.g. <TrendingUp size={16} />
 *   color   {string}          — 'blue' | 'green' | 'orange' | 'amber' | 'red' | 'gray'
 *   formula {string}          — formula/context shown as italic subtitle
 *   prefix  {string}          — optional prefix before value, e.g. '$'
 *   suffix  {string}          — optional suffix after value, e.g. '%' or 'L/100km'
 */
const AnalyticsKPICard = ({
  label,
  value,
  icon,
  color = 'blue',
  formula = '',
  prefix = '',
  suffix = '',
}) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const isNumeric = typeof value === 'number';

  return (
    <div
      className={`
        bg-card rounded-xl border border-default
        ${colors.border} border-l-[3.5px]
        p-5 transition-all duration-200
        hover:bg-card-hover hover:-translate-y-1
        hover:shadow-lg hover:shadow-black/20
        select-none
      `}
    >
      {/* Top row — label + icon */}
      <div className="flex items-center justify-between text-secondary">
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className={colors.icon}>
            {icon}
          </span>
        )}
      </div>

      {/* Value row */}
      <h3 className="font-mono text-2xl font-bold text-primary mt-2 flex items-baseline gap-1">
        {prefix && (
          <span className="text-xl font-sans text-secondary">
            {prefix}
          </span>
        )}

        {isNumeric ? (
          <CountUp
            start={0}
            end={value}
            duration={0.8}
            separator=","
            decimals={value % 1 !== 0 ? 1 : 0}
          />
        ) : (
          <span>{value}</span>
        )}

        {suffix && (
          <span className="text-xs font-sans font-medium text-muted">
            {suffix}
          </span>
        )}
      </h3>

      {/* Formula subtitle — only rendered when formula prop is provided */}
      {formula && (
        <p className="text-[10px] text-muted mt-2 font-medium italic border-t border-default/40 pt-2">
          {formula}
        </p>
      )}
    </div>
  );
};

export default AnalyticsKPICard;
export { AnalyticsKPICard };
