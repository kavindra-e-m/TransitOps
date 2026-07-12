import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useVehicles } from '../context/AppContext';
import { useDrivers } from '../context/AppContext';
import { useTrips } from '../context/AppContext';
import KPICard from '../components/common/KPICard';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const VEHICLE_TYPES = ['All Types', 'Heavy Truck', 'Medium Truck', 'Light Van'];
const STATUSES = ['All Statuses', 'Available', 'On Trip', 'In Shop', 'Retired'];

const STATUS_BAR_CONFIG = [
  { key: 'Available', color: '#22C55E' },
  { key: 'On Trip', color: '#3B82F6' },
  { key: 'In Shop', color: '#F97316' },
  { key: 'Retired', color: '#EF4444' },
];

const TRIP_COLUMNS = [
  { key: 'id', label: 'Trip ID', width: '80px' },
  { key: 'source', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'vehicleId', label: 'Vehicle', width: '90px' },
  { key: 'status', label: 'Status', width: '110px', render: (row) => <StatusBadge status={row.status} /> },
];

const Dashboard = () => {
  const allVehicles = useVehicles();
  const allDrivers = useDrivers();
  const allTrips = useTrips();

  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [lastUpdated, setLastUpdated] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const filteredVehicles = allVehicles.filter((v) => {
    const matchType = typeFilter === 'All Types' || v.type === typeFilter;
    const matchStatus = statusFilter === 'All Statuses' || v.status === statusFilter;
    return matchType && matchStatus;
  });

  const computeKPIs = useCallback(() => {
    const active = allVehicles.filter((v) => v.status !== 'Retired').length;
    const available = allVehicles.filter((v) => v.status === 'Available').length;
    const inShop = allVehicles.filter((v) => v.status === 'In Shop').length;
    const activeTrips = allTrips.filter((t) => t.status === 'Dispatched').length;
    const pendingTrips = allTrips.filter((t) => t.status === 'Draft').length;
    const onDuty = allDrivers.filter((d) => d.status === 'On Trip').length;
    const utilization = active > 0 ? Math.round(((active - available) / active) * 100) : 0;
    return { active, available, inShop, activeTrips, pendingTrips, onDuty, utilization };
  }, [allVehicles, allDrivers, allTrips]);

  const [kpis, setKpis] = useState(computeKPIs);

  const refresh = useCallback(() => {
    setKpis(computeKPIs());
    setLastUpdated(Date.now());
    setSecondsAgo(0);
  }, [computeKPIs]);

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const poll = setInterval(refresh, 20000);
    return () => clearInterval(poll);
  }, [refresh]);

  useEffect(() => {
    const tick = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const statusCounts = STATUS_BAR_CONFIG.map(({ key, color }) => ({
    key, color, count: allVehicles.filter((v) => v.status === key).length,
  }));
  const total = allVehicles.length || 1;

  const recentTrips = [...allTrips]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-input border border-default text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-border-focus">
          {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-input border border-default text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-border-focus">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-text-muted ml-auto">
          {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Vehicles" value={kpis.active} color="blue" />
        <KPICard label="Available" value={kpis.available} color="green" />
        <KPICard label="In Maintenance" value={kpis.inShop} color="orange" />
        <KPICard label="Active Trips" value={kpis.activeTrips} color="blue" />
        <KPICard label="Pending Trips" value={kpis.pendingTrips} color="gray" />
        <KPICard label="Drivers On Duty" value={kpis.onDuty} color="amber" />
        <KPICard label="Fleet Utilization" value={kpis.utilization} suffix="%" color="amber" />
      </div>

      {/* Bottom Row */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Recent Trips */}
        <div className="flex-[65]">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Recent Trips</p>
          <DataTable columns={TRIP_COLUMNS} data={recentTrips} />
        </div>

        {/* Vehicle Status Breakdown */}
        <div className="flex-[35] bg-card border border-default rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Vehicle Status</p>
          <div className="flex flex-col gap-3">
            {statusCounts.map(({ key, color, count }) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{key}</span>
                  <span className="text-text-primary font-mono">{count}</span>
                </div>
                <div className="h-2 bg-input rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / total) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last updated */}
      <p className="text-xs text-text-muted text-right">
        Last updated {secondsAgo}s ago
      </p>
    </div>
  );
};

export default Dashboard;
