import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Fuel } from 'lucide-react';
import { useExpenses } from '../../context/AppContext';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FuelCostChart = () => {
  const expenses = useExpenses();

  const data = useMemo(() => {
    const totals = {};
    expenses
      .filter(e => e.type === 'fuel')
      .forEach(e => {
        const d = new Date(e.date);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        totals[key] = (totals[key] || 0) + (e.cost || 0);
      });

    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, cost]) => {
        const [, month] = key.split('-');
        return { month: MONTH_LABELS[parseInt(month, 10) - 1], cost: parseFloat(cost.toFixed(2)) };
      });
  }, [expenses]);

  return (
    <div className="bg-card p-6 rounded-xl border border-default space-y-4 select-none">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-3 flex items-center gap-2">
        <Fuel size={16} className="text-status-shop" />
        Fuel Cost Trend
      </h3>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-text-muted">
          No fuel expense records found.
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#131826', border: '1px solid #1F2937', borderRadius: '8px' }}
                labelClassName="text-xs font-semibold text-text-secondary"
                itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#F97316' }}
                formatter={(val) => [`$${val.toLocaleString()}`, 'Fuel Cost']}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default FuelCostChart;
export { FuelCostChart };
