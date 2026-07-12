import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck } from 'lucide-react';
import { useVehicles } from '../../context/AppContext';

const STATUS_COLORS = {
  'On Trip':     '#F59E0B',
  'Available':   '#22C55E',
  'In Maintenance': '#F97316',
  'Retired':     '#6B7280',
};

const VehicleStatusChart = () => {
  const vehicles = useVehicles();

  const data = useMemo(() => {
    const counts = {};
    vehicles.forEach(v => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicles]);

  return (
    <div className="bg-card p-6 rounded-xl border border-default space-y-4 select-none">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-3 flex items-center gap-2">
        <Truck size={16} className="text-accent" />
        Vehicle Status
      </h3>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-text-muted">
          No vehicle data available.
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                animationDuration={800}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || '#6B7280'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#131826', border: '1px solid #1F2937', borderRadius: '8px' }}
                itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#E5E7EB' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VehicleStatusChart;
export { VehicleStatusChart };
