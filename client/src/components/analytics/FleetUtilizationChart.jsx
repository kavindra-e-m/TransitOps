import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Activity } from 'lucide-react';

const FleetUtilizationChart = ({ utilization = 0 }) => {
  const pct = parseFloat((utilization ?? 0).toFixed(1));
  const data = [{ value: pct }];

  const color = pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-card p-6 rounded-xl border border-default space-y-4 select-none">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-3 flex items-center gap-2">
        <Activity size={16} className="text-accent" />
        Fleet Utilization
      </h3>

      <div className="relative h-52 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            {/* Background track */}
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: '#1F2937' }}
              fill={color}
              animationDuration={800}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="font-mono text-2xl font-bold text-text-primary">{pct}%</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Utilization</span>
        </div>
      </div>
    </div>
  );
};

export default FleetUtilizationChart;
export { FleetUtilizationChart };
