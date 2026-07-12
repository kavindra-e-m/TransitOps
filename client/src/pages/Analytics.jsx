import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Coins, Activity, Percent, ShieldOff, AlertTriangle } from 'lucide-react';

import { useExpenses, useVehicles, useTrips } from '../context/AppContext';
import { detectFuelAnomalies } from '../utils/insights';
import { getAnalyticsSummaryAPI, getMonthlyRevenueAPI, getTopCostliestVehiclesAPI } from '../api/analytics';
import { usePermission } from '../hooks/usePermission';
import AnalyticsKPICard from '../components/analytics/AnalyticsKPICard';
import ExportReportButton from '../components/analytics/ExportReportButton';
import VehicleStatusChart from '../components/analytics/VehicleStatusChart';
import FleetUtilizationChart from '../components/analytics/FleetUtilizationChart';
import FuelCostChart from '../components/analytics/FuelCostChart';

const Analytics = () => {
  const vehicles = useVehicles();
  const trips = useTrips();
  const expenses = useExpenses();
  const { canEdit } = usePermission('analytics');

  const [summary, setSummary] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [costliestVehicles, setCostliestVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Fuel Refill Auditing
  const fuelAnomalies = useMemo(() => {
    const fuelLogs = expenses.filter(e => e.type === 'fuel');
    return detectFuelAnomalies(fuelLogs, expenses, trips, vehicles).filter(f => f.anomaly.flagged);
  }, [expenses, trips, vehicles]);

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
        // 403 means the logged-in role does not have view_analytics permission
        if (err.response?.status === 403) {
          setAccessDenied(true);
        } else {
          console.error("Failed to load analytics metrics", err);
          toast.error("Failed to load analytics metrics from backend.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-secondary select-none">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Computing telemetry analytics metrics...</span>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex h-64 items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldOff size={32} className="text-status-retired" />
          <p className="text-sm font-semibold text-primary">Access Restricted</p>
          <p className="text-xs text-muted max-w-xs">
            Analytics data is only available to Fleet Managers and Financial Analysts.
          </p>
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
          <h2 className="text-xl font-bold text-primary">Reports & Analytics</h2>
          <p className="text-xs text-secondary">Analyze fleet financial metrics, ROI ratios, and operational efficiencies.</p>
        </div>
        {canEdit && (
          <ExportReportButton
            summary={summary}
            monthlyRevenue={monthlyRevenue}
            costliestVehicles={costliestVehicles}
            disabled={!summary}
          />
        )}
      </div>

      {/* 4 KPI Cards — data from GET /api/analytics/summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsKPICard
          label="Fuel Efficiency"
          value={summary?.fuelEfficiency ?? 0}
          icon={<TrendingUp size={16} />}
          color="blue"
          suffix="L/100km"
          formula="Efficiency = avg liters / 100km"
        />
        <AnalyticsKPICard
          label="Fleet Utilization"
          value={summary ? parseFloat(summary.fleetUtilization.toFixed(1)) : 0}
          icon={<Activity size={16} />}
          color="green"
          suffix="%"
          formula="Utilization = active / total vehicles"
        />
        <AnalyticsKPICard
          label="Operational Cost"
          value={summary?.operationalCost ?? 0}
          icon={<Coins size={16} />}
          color="orange"
          prefix="$"
          formula="Cost = Fuel + Maint + Expenses"
        />
        <AnalyticsKPICard
          label="Vehicle ROI"
          value={summary ? parseFloat((summary.vehicleROI * 100).toFixed(1)) : 0}
          icon={<Percent size={16} />}
          color="amber"
          suffix="%"
          formula="ROI = (Revenue − (Maint + Fuel)) / Acq Cost"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
        
        {/* Left Column: Monthly Revenue Chart (65%) */}
        <div className="lg:col-span-7 bg-card p-6 rounded-xl border border-default space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-default pb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            Monthly Operational Spend
          </h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#131826', border: '1px solid #1F2937', borderRadius: '8px' }}
                  labelClassName="text-xs font-semibold text-secondary"
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-default pb-3 flex items-center gap-2">
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
                    <span className="font-semibold text-primary">{veh.reg_no}</span>
                    <span className="font-mono text-secondary">${veh.totalCost.toLocaleString()}</span>
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
              <div className="text-center py-12 text-sm text-muted">
                No cost transaction logs recorded.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Second Charts Row: Vehicle Status | Fleet Utilization | Fuel Cost */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VehicleStatusChart />
        <FleetUtilizationChart utilization={summary?.fleetUtilization ?? 0} />
        <FuelCostChart />
      </div>

      {/* Fuel Anomalies Report Section */}
      <div className="bg-card border border-default p-6 rounded-xl space-y-4 select-none">
        <div className="flex justify-between items-center border-b border-default pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <AlertTriangle size={16} className="text-status-shop" />
            Fuel Purchase Auditing & Anomalies
          </h3>
          {fuelAnomalies.length > 0 && (
            <span className="bg-status-shop/15 border border-status-shop/30 text-status-shop px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
              {fuelAnomalies.length} Flagged Events
            </span>
          )}
        </div>

        {/* Audit Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          <div className="bg-[#0B0E14]/40 border border-default/60 p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Total Audited Refills</span>
            <span className="font-mono text-base font-bold text-primary mt-1">
              {expenses.filter(e => e.type === 'fuel').length} refills
            </span>
          </div>
          <div className="bg-[#0B0E14]/40 border border-default/60 p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Anomalous Refuels</span>
            <span className="font-mono text-base font-bold text-status-shop mt-1">
              {fuelAnomalies.length} flagged
            </span>
          </div>
          <div className="bg-[#0B0E14]/40 border border-default/60 p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Refuel Anomaly Rate</span>
            <span className="font-mono text-base font-bold text-primary mt-1">
              {expenses.filter(e => e.type === 'fuel').length > 0
                ? `${Math.round((fuelAnomalies.length / expenses.filter(e => e.type === 'fuel').length) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Flagged logs list */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {fuelAnomalies.map((log) => {
            const v = vehicles.find(veh => veh.id === Number(log.vehicleId));
            return (
              <div key={log.id} className="p-3.5 rounded-lg border border-status-shop/20 bg-status-shop/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold font-mono text-xs text-primary">{v ? v.regNumber : `Vehicle #${log.vehicleId}`}</span>
                    <span className="text-[10px] text-secondary">— {v ? v.name : 'Unknown Model'}</span>
                    <span className="text-[9px] text-muted font-mono ml-auto md:ml-0">{log.date}</span>
                  </div>
                  <div className="space-y-1 pt-1.5 border-t border-default/20">
                    {log.anomaly.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1 text-[10px] text-status-shop font-medium leading-relaxed">
                        <span className="shrink-0 mt-0.5 text-[9px]">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-left md:text-right space-y-0.5 select-none font-mono">
                  <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Charged Amount</span>
                  <span className="text-sm font-bold text-[#ffb4ab]">${log.cost.toLocaleString()}</span>
                  <span className="text-[9px] text-muted block">{log.liters} liters refilled</span>
                </div>
              </div>
            );
          })}
          {fuelAnomalies.length === 0 && (
            <div className="text-center py-10 text-xs text-muted border border-dashed border-default rounded-lg">
              No refuel anomalies flagged in the current dataset. All refuels comply with audit rules.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Analytics;
export { Analytics };
