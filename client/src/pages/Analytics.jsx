import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Bar as RechartsBar 
} from 'recharts';
import { Download, TrendingUp, Coins, Activity, Percent, Calendar } from 'lucide-react';

import { getAnalyticsSummaryAPI, getMonthlyRevenueAPI, getTopCostliestVehiclesAPI } from '../api/analytics';

const Analytics = () => {
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
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary select-none">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Computing telemetry analytics metrics...</span>
        </div>
      </div>
    );
  }

  // Costliest bar max value for width percentages
  const maxCost = costliestVehicles.length > 0 ? Math.max(...costliestVehicles.map(v => v.totalCost)) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Reports & Analytics</h2>
          <p className="text-xs text-text-secondary">Analyze fleet financial metrics, ROI ratios, and operational efficiencies.</p>
        </div>
        <button
          onClick={handleCSVExport}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-[#0B0E14] font-semibold text-xs rounded-lg shadow-lg shadow-accent/10 border border-transparent transition-all flex items-center gap-2"
        >
          <Download size={14} />
          Export CSV Report
        </button>
      </div>

      {/* 4 Metric cards top (formula shown as subtext) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-card rounded-xl border border-default border-l-4 border-l-[#3B82F6] p-5 transition-all hover:bg-card-hover select-none">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fuel Efficiency</span>
            <TrendingUp size={16} className="text-[#3B82F6]" />
          </div>
          <h3 className="font-mono text-2xl font-bold text-text-primary mt-2">
            {summary?.fuelEfficiency} <span className="text-xs font-sans font-medium text-text-muted">L/100km</span>
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-medium italic border-t border-default/40 pt-2">
            Efficiency = avg liters / 100km
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-card rounded-xl border border-default border-l-4 border-l-[#22C55E] p-5 transition-all hover:bg-card-hover select-none">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fleet Utilization</span>
            <Activity size={16} className="text-[#22C55E]" />
          </div>
          <h3 className="font-mono text-2xl font-bold text-text-primary mt-2">
            {summary?.fleetUtilization.toFixed(1)}<span className="text-xs font-sans font-medium text-text-muted">%</span>
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-medium italic border-t border-default/40 pt-2">
            Utilization = active / total vehicles
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-card rounded-xl border border-default border-l-4 border-l-[#F97316] p-5 transition-all hover:bg-card-hover select-none">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Operational Cost</span>
            <Coins size={16} className="text-[#F97316]" />
          </div>
          <h3 className="font-mono text-2xl font-bold text-text-primary mt-2">
            ${summary?.operationalCost.toLocaleString()}
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-medium italic border-t border-default/40 pt-2">
            Cost = Fuel + Maint + Expenses
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-card rounded-xl border border-default border-l-4 border-l-[#F59E0B] p-5 transition-all hover:bg-card-hover select-none">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Vehicle ROI</span>
            <Percent size={16} className="text-[#F59E0B]" />
          </div>
          <h3 className="font-mono text-2xl font-bold text-text-primary mt-2">
            {(summary?.vehicleROI * 100).toFixed(1)}<span className="text-xs font-sans font-medium text-text-muted">%</span>
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-medium italic border-t border-default/40 pt-2">
            ROI = (Revenue − (Maint + Fuel)) / Acq Cost
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
        
        {/* Left Column: Monthly Revenue Chart (65%) */}
        <div className="lg:col-span-7 bg-card p-6 rounded-xl border border-default space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            Monthly Revenue Trends
          </h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#131826', border: '1px solid #1F2937', borderRadius: '8px' }}
                  labelClassName="text-xs font-semibold text-text-secondary"
                  itemStyle={{ textTransform: 'capitalize', color: '#F59E0B', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#F59E0B" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Top Costliest Vehicles Chart (35%) */}
        <div className="lg:col-span-5 bg-card p-6 rounded-xl border border-default space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-3 flex items-center gap-2">
            <Coins size={16} className="text-status-shop" />
            Top Costliest Vehicles
          </h3>
          
          {/* Custom Horizontal Bar representation */}
          <div className="space-y-4 pt-2">
            {costliestVehicles.map((veh, idx) => {
              const widthPct = `${Math.max(10, (veh.totalCost / maxCost) * 100)}%`;
              
              return (
                <div key={veh.vehicle_id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">{veh.reg_no}</span>
                    <span className="font-mono text-text-secondary">${veh.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-input rounded-full h-2 overflow-hidden border border-default/50">
                    <motion.div
                      className="bg-status-shop h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: widthPct }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
            
            {costliestVehicles.length === 0 && (
              <div className="text-center py-12 text-sm text-text-muted">
                No cost transaction logs recorded.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
export { Analytics };
