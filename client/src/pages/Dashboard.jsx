import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicles, useDrivers, useTrips, useIsLive, useMaintenance } from '../context/AppContext';
import StatusBadge from '../components/common/StatusBadge';
import KPICard from '../components/common/KPICard';
import { getLicenseAlertDrivers, getMaintenanceAlertVehicles } from '../utils/insights';
import { 
  TrendingUp, TrendingDown, CheckCircle, Leaf, AlertTriangle, 
  MapPin, Clock, ShieldCheck, Zap, ChevronRight, Play, CheckSquare, XCircle, ShieldAlert, Wrench,
  Truck, Users, Route, Activity
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const allVehicles = useVehicles();
  const allDrivers = useDrivers();
  const allTrips = useTrips();
  const allMaintenance = useMaintenance();
  const isLive = useIsLive();

  // Filters State
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // Helper to determine region of a vehicle based on coordinate bounding
  const getVehicleRegion = (v) => {
    if (v.latitude === undefined || v.latitude === null) return 'South'; // default region fallback
    return v.latitude > 13.0827 ? 'North' : 'South';
  };

  // List of unique vehicle types for filtering
  const vehicleTypes = useMemo(() => {
    const types = new Set(allVehicles.map(v => v.type).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [allVehicles]);

  const vehicleStatuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
  const regionsList = ['All', 'North', 'South'];

  // Filter vehicles based on selections
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      const typeMatch = filterType === 'All' || v.type === filterType;
      const statusMatch = filterStatus === 'All' || v.status === filterStatus;
      const regionMatch = filterRegion === 'All' || getVehicleRegion(v) === filterRegion;
      return typeMatch && statusMatch && regionMatch;
    });
  }, [allVehicles, filterType, filterStatus, filterRegion]);

  // Compute live statistics dynamically from filtered vehicles
  const kpis = useMemo(() => {
    const totalVehiclesCount = filteredVehicles.length;
    const activeVehicles = filteredVehicles.filter(v => v.status !== 'Retired').length;
    const availableVehicles = filteredVehicles.filter(v => v.status === 'Available').length;
    const vehiclesInMaintenance = filteredVehicles.filter(v => v.status === 'In Shop').length;
    const vehiclesOnTrip = filteredVehicles.filter(v => v.status === 'On Trip').length;

    const filteredVehicleIds = new Set(filteredVehicles.map(v => v.id));

    // Active trips (Dispatched status) involving these vehicles
    const activeTrips = allTrips.filter(t => t.status === 'Dispatched' && filteredVehicleIds.has(t.vehicleId)).length;
    // Pending trips (Draft status) involving these vehicles
    const pendingTrips = allTrips.filter(t => t.status === 'Draft' && filteredVehicleIds.has(t.vehicleId)).length;

    // Drivers on duty for active trips, plus available drivers (when unfiltered)
    const activeTripDrivers = new Set(allTrips.filter(t => t.status === 'Dispatched' && filteredVehicleIds.has(t.vehicleId)).map(t => t.driverId));
    const availableDriversCount = allDrivers.filter(d => d.status === 'Available').length;
    const driversOnDuty = activeTripDrivers.size + (filterType === 'All' && filterStatus === 'All' && filterRegion === 'All' ? availableDriversCount : 0);

    const fleetUtilization = activeVehicles > 0 ? (vehiclesOnTrip / activeVehicles) * 100 : 0;

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: parseFloat(fleetUtilization.toFixed(1))
    };
  }, [filteredVehicles, allTrips, allDrivers, filterType, filterStatus, filterRegion]);

  // General stats
  const stats = useMemo(() => {
    const avgFuel = 6.8; 
    const onTimePct = 94.2; 
    const co2Tons = 14.2;
    return { onTimePct, avgFuel, co2Tons };
  }, []);

  // Get active shipments (Dispatched or In Transit) sorted by creation time
  const activeShipments = useMemo(() => {
    const filteredVehicleIds = new Set(filteredVehicles.map(v => v.id));
    return [...allTrips]
      .filter(t => t.status === 'Dispatched' && filteredVehicleIds.has(t.vehicleId))
      .slice(0, 4);
  }, [allTrips, filteredVehicles]);

  return (
    <div className="p-6 min-h-screen text-primary">
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: KEY METRICS & MAP & TABLES (col-span-9) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* ── Filters Bar (pill buttons) ── */}
          <div
            className="rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Fleet Filters</h3>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Filter telemetry KPIs in real-time</p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {/* Type filter pills */}
              <div className="flex flex-col gap-1.5">
                <span className="section-label">Vehicle Type</span>
                <div className="flex gap-1">
                  {vehicleTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={{
                        background: filterType === t ? 'rgba(255,193,116,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${filterType === t ? 'rgba(255,193,116,0.4)' : 'var(--border-default)'}`,
                        color: filterType === t ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Status filter pills */}
              <div className="flex flex-col gap-1.5">
                <span className="section-label">Status</span>
                <div className="flex gap-1">
                  {vehicleStatuses.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={{
                        background: filterStatus === s ? 'rgba(255,193,116,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${filterStatus === s ? 'rgba(255,193,116,0.4)' : 'var(--border-default)'}`,
                        color: filterStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Region filter pills */}
              <div className="flex flex-col gap-1.5">
                <span className="section-label">Region</span>
                <div className="flex gap-1">
                  {regionsList.map(r => (
                    <button
                      key={r}
                      onClick={() => setFilterRegion(r)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={{
                        background: filterRegion === r ? 'rgba(255,193,116,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${filterRegion === r ? 'rgba(255,193,116,0.4)' : 'var(--border-default)'}`,
                        color: filterRegion === r ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >{r}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Key Metrics Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Fleet Utilization"
              value={kpis.fleetUtilization}
              suffix="%"
              icon={Activity}
              color="amber"
              trend={1}
              trendLabel="Active on road"
            />
            <KPICard
              label="Active Vehicles"
              value={kpis.activeVehicles}
              icon={Truck}
              color="green"
              trend={1}
              trendLabel="Non-retired fleet"
            />
            <KPICard
              label="Available Vehicles"
              value={kpis.availableVehicles}
              icon={CheckCircle}
              color="green"
              trend={0}
              trendLabel="Ready for dispatch"
            />
            <KPICard
              label="In Maintenance"
              value={kpis.vehiclesInMaintenance}
              icon={Wrench}
              color="orange"
              trend={-1}
              trendLabel="Currently in shop"
            />
            <KPICard
              label="Active Trips"
              value={kpis.activeTrips}
              icon={Route}
              color="blue"
              trend={1}
              trendLabel="Dispatched routes"
            />
            <KPICard
              label="Pending Trips"
              value={kpis.pendingTrips}
              icon={Clock}
              color="muted"
              trend={0}
              trendLabel="Draft itineraries"
            />
            <KPICard
              label="Drivers On Duty"
              value={kpis.driversOnDuty}
              icon={Users}
              color="green"
              trend={1}
              trendLabel="Active & standby"
            />
            <KPICard
              label="On-Time Performance"
              value={stats.onTimePct}
              suffix="%"
              icon={ShieldCheck}
              color="blue"
              trend={0}
              trendLabel="Stable operations"
            />

          </div>

          {/* GPS Clusters Map Widget */}
          <div className="bg-card border border-outline-variant rounded-xl overflow-hidden relative group h-[400px]">
            {/* Map Header details overlay */}
            <div className="absolute top-4 left-4 z-10 bg-[#10131a]/85 backdrop-blur-md p-3.5 rounded-lg border border-outline-variant select-none">
              <h3 className="text-xs font-bold uppercase text-primary tracking-wide">Fleet Distribution</h3>
              <p className="text-[10px] text-secondary font-medium">Real-time GPS clusters</p>
            </div>

            {/* Simulated Satellite Map */}
            <div className="w-full h-full bg-[#131826] relative overflow-hidden select-none">
              <div 
                className="absolute inset-0 opacity-40 grayscale contrast-125 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2A1Rxc_J6K_Svof5eV2qLiDflBHbpGkFZTamuRLm0oMQJGGQNOOVYjMMIBEZsSs3fFGDpDNoIjJIJrfuZZ8N66VORdcfFr-r1Ytpgy400rpycr5yvOMN-Cse17QowLfhDMx-8u07bl0S2j-rF5-dez5qbGU5NbYN5-zsE9Nzb1nmBtPpKtDa8uL6DUi17hU8YV8A74IOsqZ3gsCrqUwrW8ocnfbp0v9W67bort6upRZTXjqkM0EW-GGxxFoUOXFWdKMkVE6pHehr5')" }}
              />
              
              {/* Pulse Marker: 84 Trucks */}
              <div className="absolute top-[30%] left-[40%] flex items-center gap-2">
                <span className="pulse-dot" />
                <div className="bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  84 Trucks
                </div>
              </div>

              {/* Pulse Marker: 112 Vans */}
              <div className="absolute top-[60%] left-[25%] flex items-center gap-2">
                <span className="pulse-dot animate-pulse" />
                <div className="bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  112 Vans
                </div>
              </div>

              {/* Pulse Marker: Delay Cluster */}
              <div className="absolute top-[45%] left-[70%] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-retired animate-ping shrink-0" />
                <div className="bg-status-retired/10 border border-status-retired/30 text-status-retired px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  Delay Cluster
                </div>
              </div>
            </div>

            {/* Map Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <button className="w-8 h-8 bg-sidebar border border-outline-variant rounded flex items-center justify-center hover:bg-card-hover transition-colors font-bold text-sm text-primary">
                +
              </button>
              <button className="w-8 h-8 bg-sidebar border border-outline-variant rounded flex items-center justify-center hover:bg-card-hover transition-colors font-bold text-sm text-primary">
                -
              </button>
              <button className="w-8 h-8 bg-accent text-[#0B0E14] rounded flex items-center justify-center hover:brightness-110 transition-all shadow-md shadow-accent/20">
                <MapPin size={14} />
              </button>
            </div>
          </div>

          {/* Active Shipments Table list */}
          <div className="bg-card border border-outline-variant rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-card-hover/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Active Shipments</h3>
              <span className="text-[10px] text-accent font-semibold hover:underline cursor-pointer flex items-center">
                View All <ChevronRight size={12} />
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B0E14]/30 select-none">
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-secondary">Trip ID</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-secondary">Route / Destination</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-secondary">Vehicle Status</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-secondary text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-xs">
                  {activeShipments.map((trip) => {
                    const veh = allVehicles.find(v => v.id === trip.vehicleId);
                    return (
                      <tr key={trip.id} className="hover:bg-card-hover/40 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-accent">{trip.id}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{trip.source} ➔ {trip.destination}</span>
                            <span className="text-[10px] text-secondary mt-0.5">Cargo: {trip.cargoWeight} kg</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-status-available bg-status-available/10 border border-status-available/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
                            In Transit
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-secondary">
                          {trip.plannedDistance} km
                        </td>
                      </tr>
                    );
                  })}
                  {activeShipments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-secondary font-medium select-none">
                        No active dispatches found. Dispatched trips will update here instantly.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ALERTS & DISPATCHER PERFORMANCE (col-span-3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Credentials Risk Card */}
          <div className="bg-card border border-outline-variant rounded-xl flex flex-col p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <ShieldAlert size={15} className="text-[#ffb4ab]" />
                Credentials Risk
              </h3>
              {getLicenseAlertDrivers(allDrivers).length > 0 && (
                <span className="bg-[#ffb4ab]/15 border border-[#ffb4ab]/30 text-[#ffb4ab] px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
                  {getLicenseAlertDrivers(allDrivers).length} Action
                </span>
              )}
            </div>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {getLicenseAlertDrivers(allDrivers).map((driver) => {
                const isExpired = driver.expiryInfo.tier === 'expired';
                return (
                  <div
                    key={driver.id}
                    onClick={() => navigate('/drivers')}
                    className="p-2.5 rounded border border-default/40 hover:border-accent bg-[#0B0E14]/45 hover:bg-[#0B0E14]/75 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary group-hover:text-accent truncate">{driver.name}</p>
                      <p className="text-[10px] text-muted font-mono mt-0.5">Expires: {driver.licenseExpiryDate}</p>
                    </div>
                    {isExpired ? (
                      <span className="text-[8px] bg-status-retired/10 border border-status-retired/25 text-status-retired px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                        Expired
                      </span>
                    ) : (
                      <span className="text-[8px] bg-[#F97316]/10 border border-[#F97316]/25 text-[#F97316] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                        {driver.expiryInfo.daysLeft}d left
                      </span>
                    )}
                  </div>
                );
              })}
              {getLicenseAlertDrivers(allDrivers).length === 0 && (
                <div className="text-center py-6 text-xs text-muted select-none">
                  All credentials up to date.
                </div>
              )}
            </div>
          </div>

          {/* Vehicles Pending Service Card */}
          <div className="bg-card border border-outline-variant rounded-xl flex flex-col p-4 space-y-3">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Wrench size={14} className="text-status-shop" />
                Vehicles Pending Service
              </h3>
              {getMaintenanceAlertVehicles(allVehicles, allMaintenance).length > 0 && (
                <span className="bg-status-shop/15 border border-status-shop/30 text-status-shop px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
                  {getMaintenanceAlertVehicles(allVehicles, allMaintenance).length} Warning
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {getMaintenanceAlertVehicles(allVehicles, allMaintenance).map((v) => {
                const percent = Math.min(Math.round((v.maintenanceFlag.kmSince / 5000) * 100), 100);
                const isOverdue = v.maintenanceFlag.status === 'overdue';
                return (
                  <div
                    key={v.id}
                    onClick={() => navigate('/maintenance')}
                    className="p-2.5 rounded border border-default/40 hover:border-accent bg-[#0B0E14]/45 hover:bg-[#0B0E14]/75 transition-all cursor-pointer space-y-2 group select-none"
                  >
                    <div className="flex justify-between items-center min-w-0">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary group-hover:text-accent truncate">{v.regNumber}</p>
                        <p className="text-[9px] text-muted mt-0.5 truncate">{v.name}</p>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-wider ${
                        isOverdue ? 'bg-status-retired/10 border-status-retired/20 text-status-retired animate-pulse' : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                      }`}>
                        {isOverdue ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold text-secondary">
                        <span>{v.maintenanceFlag.kmSince.toLocaleString()} / 5,000 km</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-1 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-default/30">
                        <div
                          className={`h-full rounded-full ${isOverdue ? 'bg-status-retired' : 'bg-yellow-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {getMaintenanceAlertVehicles(allVehicles, allMaintenance).length === 0 && (
                <div className="text-center py-6 text-xs text-muted select-none">
                  All mileage levels optimal.
                </div>
              )}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-card border border-outline-variant rounded-xl flex-1 flex flex-col min-h-[450px]">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-card-hover/20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <AlertTriangle size={15} className="text-accent" />
                Recent Alerts
              </h3>
              <span className="bg-status-retired text-[#0B0E14] px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                3 New
              </span>
            </div>

            {/* List of Warnings */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Alert 1 */}
              <div className="p-4 rounded-lg border-l-4 border-status-retired bg-status-retired/5 hover:bg-status-retired/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-status-retired font-bold uppercase tracking-widest">Mechanical Failure</span>
                  <span className="text-[10px] text-secondary">2m ago</span>
                </div>
                <p className="text-xs font-bold text-primary mb-1">Vehicle TRK-9041 - Engine Overheating</p>
                <p className="text-[10px] text-secondary leading-relaxed">
                  Driver reported sudden temperature spike near Mile Marker 42. Immediate service dispatch required.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 bg-status-retired hover:brightness-115 text-[#0B0E14] rounded text-[10px] font-bold transition-all active:scale-95">
                    Emergency Dispatch
                  </button>
                  <button className="px-3 py-1 border border-outline-variant hover:bg-card text-primary rounded text-[10px] font-bold transition-all">
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-4 rounded-lg border-l-4 border-accent bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-accent font-bold uppercase tracking-widest">Route Deviation</span>
                  <span className="text-[10px] text-secondary">14m ago</span>
                </div>
                <p className="text-xs font-bold text-primary mb-1">Vehicle TRK-8122 - Off Route</p>
                <p className="text-[10px] text-secondary leading-relaxed">
                  Vehicle departed from planned highway path in Seattle urban sector. Possible congestion bypass.
                </p>
              </div>

              {/* Alert 3 */}
              <div className="p-4 rounded-lg border-l-4 border-status-ontrip bg-status-ontrip/5 hover:bg-status-ontrip/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-status-ontrip font-bold uppercase tracking-widest">Weather Warning</span>
                  <span className="text-[10px] text-secondary">42m ago</span>
                </div>
                <p className="text-xs font-bold text-primary mb-1">Heavy Snow - Sector 4</p>
                <p className="text-[10px] text-secondary leading-relaxed">
                  Blizzard storm alert on mountain pass. Suggest rerouting all active freight lines.
                </p>
              </div>

            </div>

            <button className="m-4 py-2 text-center border border-outline-variant rounded text-[10px] font-bold uppercase tracking-wider text-secondary hover:bg-card-hover transition-all">
              View All Notifications Log
            </button>
          </div>

          {/* Dispatcher Performance KPI */}
          <div className="bg-card border border-outline-variant p-5 rounded-xl space-y-4">
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Dispatcher Performance</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-secondary font-medium">Alert Response Time</span>
                  <span className="text-accent font-bold font-mono">1.2s</span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-secondary font-medium">Optimization Efficiency</span>
                  <span className="text-status-available font-bold font-mono">98%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden">
                  <div className="h-full bg-status-available rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Real-time WebSockets Live Badge */}
      <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider select-none mt-6">
        {isLive ? (
          <div className="flex items-center gap-1.5 text-status-available bg-status-available/10 border border-status-available/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
            Live Telemetry Active
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted bg-border-default/20 border border-default rounded-full px-3 py-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-muted" />
            Reconnecting to Server...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
