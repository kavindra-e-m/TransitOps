import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  Download, Compass, ShieldAlert, CheckCircle, Clock, 
  Settings, User, ChevronRight, Activity, Cpu, Percent, Fuel
} from 'lucide-react';

import { getAnalyticsSummaryAPI, getMonthlyRevenueAPI, getTopCostliestVehiclesAPI } from '../api/analytics';
import { useDrivers } from '../context/AppContext';

// Reusable Custom KPI Card for Analytics Page
const AnalyticsKPICard = ({ label, value, icon: Icon, color, formula, prefix = '', suffix = '' }) => {
  const COLOR_CONFIG = {
    blue:   { border: 'border-l-[#3B82F6]', text: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/5' },
    green:  { border: 'border-l-[#51e77b]', text: 'text-[#51e77b]', bg: 'bg-[#51e77b]/5' },
    orange: { border: 'border-l-[#F97316]', text: 'text-[#F97316]', bg: 'bg-[#F97316]/5' },
    amber:  { border: 'border-l-[#ffc174]', text: 'text-[#ffc174]', bg: 'bg-[#ffc174]/5' },
    red:    { border: 'border-l-[#ffb4ab]', text: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/5' },
  };

  const currentTheme = COLOR_CONFIG[color] || COLOR_CONFIG.blue;

  return (
    <div className={`bg-card rounded-xl border border-outline-variant ${currentTheme.border} border-l-[3.5px] p-5 hover:-translate-y-0.5 transition-all select-none`}>
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className={currentTheme.text} />}
      </div>
      <h3 className="font-mono text-2xl font-bold text-text-primary mt-2">
        {prefix}{value} <span className="text-xs font-sans font-medium text-text-secondary">{suffix}</span>
      </h3>
      {formula && (
        <p className="text-[10px] text-text-muted mt-2 font-medium italic border-t border-outline-variant/30 pt-2">
          {formula}
        </p>
      )}
    </div>
  );
};

const Analytics = () => {
  const driversList = useDrivers();
  const [summary, setSummary] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [costliestVehicles, setCostliestVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all analytics datasets
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [sumData, revData, costData] = await Promise.all([
          getAnalyticsSummaryAPI(),
          getMonthlyRevenueAPI(),
          getTopCostliestVehiclesAPI()
        ]);
        setSummary(sumData);
        setMonthlyRevenue(revData);
        setCostliestVehicles(costData);
      } catch (err) {
        console.error("Failed to load analytics metrics", err);
        toast.error("Failed to load analytics metrics from backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // CSV Generator function
  const handleCSVExport = () => {
    if (!summary) return;
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Category,Parameter,Value,Formula/Context\n";

      // Metrics Summary
      csvContent += `KPI,Fuel Efficiency,${summary.fuelEfficiency} L/100km,Avg liters consumed per 100km\n`;
      csvContent += `KPI,Fleet Utilization,${summary.fleetUtilization.toFixed(1)}%,active vehicles / total vehicles\n`;
      csvContent += `KPI,Operational Cost,$${summary.operationalCost.toLocaleString()},"Fuel + Maintenance + Expenses"\n`;
      csvContent += `KPI,Vehicle ROI,${(summary.vehicleROI * 100).toFixed(1)}%,"ROI = (Revenue - (Maint + Fuel)) / Acq Cost"\n`;

      // Monthly Revenue Table
      csvContent += "\nMonthly Revenue Records\nMonth,Revenue ($)\n";
      monthlyRevenue.forEach(row => {
        csvContent += `${row.month},${row.revenue}\n`;
      });

      // Costliest Vehicles Table
      csvContent += "\nTop Costliest Vehicles\nRegistration Number,Total Operational Cost ($)\n";
      costliestVehicles.forEach(row => {
        csvContent += `${row.reg_no},${row.totalCost}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TransitOps_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report downloaded successfully.");
    } catch (err) {
      toast.error("Failed to generate CSV export.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-text-secondary select-none bg-[#0B0E14]">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Computing telemetry analytics metrics...</span>
        </div>
      </div>
    );
  }

  // Map monthly data for chart mapping (supporting bar count columns)
  const chartData = [
    { name: 'AUG 01', cost: 650 },
    { name: 'AUG 08', cost: 720 },
    { name: 'AUG 15', cost: 580 },
    { name: 'AUG 29', cost: 845, highlight: true }
  ];

  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen space-y-6 text-text-primary">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-4 select-none">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Fleet Analytics <span className="text-xs font-bold text-accent tracking-wider uppercase ml-1">Q3 Performance</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Visualizing real-time telemetry, efficiency metrics, and maintenance forecasting for the entire fleet.
          </p>
        </div>
        
        {/* Buttons actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCSVExport}
            className="px-4 py-2 border border-outline-variant hover:bg-card-hover text-text-primary font-bold text-xs rounded-lg transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            <Download size={14} />
            Export CSV
          </button>
          
          <button
            onClick={() => alert("Generating full PDF telemetry analysis report...")}
            className="px-4 py-2 bg-accent hover:brightness-110 text-[#0B0E14] font-bold text-xs rounded-lg shadow-lg shadow-accent/10 transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsKPICard 
          label="Avg Fuel Efficiency" 
          value="6.8" 
          suffix="MPG" 
          icon={Fuel} 
          color="amber"
          formula="+4.2% vs last month"
        />
        <AnalyticsKPICard 
          label="Safety Score" 
          value="92.4" 
          suffix="PTS" 
          icon={ShieldAlert} 
          color="blue"
          formula="-0.8% critical incidents detected"
        />
        <AnalyticsKPICard 
          label="Uptime Rate" 
          value="98.1" 
          suffix="%" 
          icon={CheckCircle} 
          color="green"
          formula="Optimal operations"
        />
        <AnalyticsKPICard 
          label="Maint. Forecast" 
          value="12" 
          suffix="UNITS" 
          icon={Settings} 
          color="orange"
          formula="Upcoming 72h scheduled service"
        />
      </div>

      {/* Charts & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fuel Consumption Trend Bar Chart (col-span-8) */}
        <div className="lg:col-span-8 bg-card border border-outline-variant rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary border-b border-outline-variant/30 pb-3 flex items-center justify-between">
            <span>Fuel Consumption Trends</span>
            <span className="text-[10px] text-text-secondary font-medium tracking-normal capitalize">Last 30 Days</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#10131a', border: '1px solid #1F2937', borderRadius: '8px' }}
                  labelClassName="text-xs font-semibold text-text-secondary"
                  itemStyle={{ textTransform: 'capitalize', color: '#ffc174', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Bar dataKey="cost" fill="#8d745a" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.highlight ? '#ffc174' : '#8d745a'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Maintenance Panel (col-span-4) */}
        <div className="lg:col-span-4 bg-card border border-outline-variant rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary border-b border-outline-variant/30 pb-3">
              Predictive Maintenance
            </h3>
            
            <div className="space-y-4 pt-3 text-xs">
              {/* Unit 804 */}
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-status-retired mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">Unit #804 - Brake System</span>
                    <span className="bg-status-retired/10 border border-status-retired/20 text-status-retired px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                      Critical
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    High risk of failure detected by telemetry sensors.
                  </p>
                </div>
              </div>

              {/* Unit 212 */}
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-status-shop mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">Unit #212 - Oil Pressure</span>
                    <span className="bg-status-shop/10 border border-status-shop/20 text-status-shop px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                      Urgent
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Scheduled change recommended within 48 hours.
                  </p>
                </div>
              </div>

              {/* Unit 415 */}
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-status-ontrip mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">Unit #415 - Tire Rotation</span>
                    <span className="bg-status-ontrip/10 border border-status-ontrip/20 text-status-ontrip px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                      Standard
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Threshold reached: 15,000 miles since last service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2 border border-outline-variant rounded text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:bg-card-hover transition-all">
            View Full Log
          </button>
        </div>

      </div>

      {/* Top Performance Safety Leaderboard Table */}
      <div className="bg-card border border-outline-variant rounded-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-card-hover/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Top Performance Safety Leaderboard</h3>
          <div className="flex items-center gap-4 text-[9px] font-extrabold uppercase tracking-wider select-none">
            <span className="flex items-center gap-1.5 text-status-available">
              <span className="w-1.5 h-1.5 rounded-full bg-status-available" /> Exemplary
            </span>
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Average
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0E14]/30 select-none">
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Driver Identity</th>
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Distance (KM)</th>
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Hard Braking</th>
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Idle Time</th>
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right">Safety Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {driversList.slice(0, 3).map((driver, idx) => {
                const distanceMock = (14285.5 - idx * 2400).toLocaleString(undefined, { minimumFractionDigits: 2 });
                const brakingMock = idx === 0 ? 0 : idx * 2;
                const idleMock = idx === 0 ? '0.2%' : `${(idx * 1.5).toFixed(1)}%`;
                
                return (
                  <tr key={driver.id} className="hover:bg-card-hover/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-card border border-accent/25 flex items-center justify-center font-bold text-accent text-xs">
                          {driver.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">{driver.name}</span>
                          <span className="text-[10px] text-text-secondary mt-0.5">ID: TRS-00{driver.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-text-primary">{distanceMock}</td>
                    <td className="px-5 py-4 font-mono text-text-primary">{brakingMock}</td>
                    <td className="px-5 py-4 font-mono text-text-secondary">{idleMock}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-mono font-bold text-status-available">{driver.safetyScore.toFixed(1)}</span>
                        <div className="h-1.5 w-24 bg-[#0B0E14] rounded-full overflow-hidden shrink-0">
                          <div 
                            className="h-full bg-status-available rounded-full" 
                            style={{ width: `${driver.safetyScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
