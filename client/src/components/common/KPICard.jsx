import React from 'react';
import CountUp from 'react-countup';

const KPICard = ({ label, value, color = "blue", prefix = "", suffix = "" }) => {
  // Border and accent color mappings
  const colorMap = {
    green: "border-l-[#22C55E] text-[#22C55E]",
    blue: "border-l-[#3B82F6] text-[#3B82F6]",
    orange: "border-l-[#F97316] text-[#F97316]",
    red: "border-l-[#EF4444] text-[#EF4444]",
    gray: "border-l-[#6B7280] text-[#6B7280]",
    amber: "border-l-[#F59E0B] text-[#F59E0B]"
  };

  const borderClass = colorMap[color] || "border-l-default";

  const isNumeric = typeof value === 'number';

  return (
    <div 
      className={`bg-card rounded-xl border border-default ${borderClass} border-l-[3.5px] p-5 transition-all duration-200 hover:bg-card-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 select-none`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </p>
      <h3 className="kpi-value-custom mt-2 text-text-primary font-mono select-all flex items-baseline">
        {prefix && <span className="text-xl font-sans mr-0.5 text-text-secondary">{prefix}</span>}
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
        {suffix && <span className="text-sm font-sans ml-1 text-text-secondary">{suffix}</span>}
      </h3>
    </div>
  );
};

export default KPICard;
export { KPICard };
