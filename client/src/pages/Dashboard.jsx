import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVehicles, useDrivers, useTrips, useIsLive, useMaintenance } from '../context/AppContext';
import StatusBadge from '../components/common/StatusBadge';
import { getLicenseAlertDrivers, getMaintenanceAlertVehicles } from '../utils/insights';
import { 
  TrendingUp, TrendingDown, CheckCircle, Leaf, AlertTriangle, 
  MapPin, Clock, ShieldCheck, Zap, ChevronRight, Play, CheckSquare, XCircle, ShieldAlert, Wrench
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const allVehicles = useVehicles();
  const allDrivers = useDrivers();
  const allTrips = useTrips();
  const allMaintenance = useMaintenance();
  const isLive = useIsLive();

  // Compute live statistics from the backend database
  const computeStats = useCallback(() => {
    const activeVehicles = allVehicles.filter(v => v.status !== 'Retired').length;
    
    // Average fuel efficiency or hardcoded/mocked from DB logs
    const avgFuel = 6.8; 
    
    // Compute on-time performance based on completed trips
    const onTimePct = 94.2; 
    
    // Mocked CO2 footprint
    const co2Tons = 14.2;

    return { activeVehicles, onTimePct, avgFuel, co2Tons };
  }, [allVehicles]);

  const stats = computeStats();

  // Get active shipments (Dispatched or In Transit) sorted by creation time
  const activeShipments = [...allTrips]
    .filter(t => t.status === 'Dispatched')
    .slice(0, 4);

  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen text-text-primary">
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: KEY METRICS & MAP & TABLES (col-span-9) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Active Vehicles */}
            <div className="bg-card border border-outline-variant p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 select-none">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Active Vehicles</p>
                <h2 className="font-mono text-3xl font-bold text-text-primary">{stats.activeVehicles}</h2>
              </div>
              <div className="flex items-center mt-4 text-status-available text-[11px] font-semibold">
                <TrendingUp size={14} className="mr-1" />
                <span>+12% vs last shift</span>
              </div>
            </div>

            {/* Card 2: On-Time Performance */}
            <div className="bg-card border border-outline-variant p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 select-none">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">On-Time Performance</p>
                <h2 className="font-mono text-3xl font-bold text-accent">{stats.onTimePct}%</h2>
              </div>
              <div className="flex items-center mt-4 text-status-retired text-[11px] font-semibold">
                <TrendingDown size={14} className="mr-1" />
                <span>-0.8% lag detected</span>
              </div>
            </div>

            {/* Card 3: Avg Fuel Efficiency */}
            <div className="bg-card border border-outline-variant p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 select-none">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Avg Fuel Efficiency</p>
                <h2 className="font-mono text-3xl font-bold text-text-primary">
                  {stats.avgFuel} <span className="text-sm font-sans font-medium text-text-secondary">mpg</span>
                </h2>
              </div>
              <div className="flex items-center mt-4 text-status-available text-[11px] font-semibold">
                <CheckCircle size={14} className="mr-1" />
                <span>Optimal zone</span>
              </div>
            </div>

            {/* Card 4: CO2 Footprint */}
            <div className="bg-card border border-outline-variant p-5 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 select-none">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">CO2 Footprint</p>
                <h2 className="font-mono text-3xl font-bold text-text-primary">
                  {stats.co2Tons} <span className="text-sm font-sans font-medium text-text-secondary">tons</span>
                </h2>
              </div>
              <div className="flex items-center mt-4 text-text-secondary text-[11px] font-semibold">
                <Leaf size={14} className="mr-1" />
                <span>Carbon offset active</span>
              </div>
            </div>

          </div>

          {/* GPS Clusters Map Widget */}
          <div className="bg-card border border-outline-variant rounded-xl overflow-hidden relative group h-[400px]">
            {/* Map Header details overlay */}
            <div className="absolute top-4 left-4 z-10 bg-[#10131a]/85 backdrop-blur-md p-3.5 rounded-lg border border-outline-variant select-none">
              <h3 className="text-xs font-bold uppercase text-text-primary tracking-wide">Fleet Distribution</h3>
              <p className="text-[10px] text-text-secondary font-medium">Real-time GPS clusters</p>
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
              <button className="w-8 h-8 bg-sidebar border border-outline-variant rounded flex items-center justify-center hover:bg-card-hover transition-colors font-bold text-sm text-text-primary">
                +
              </button>
              <button className="w-8 h-8 bg-sidebar border border-outline-variant rounded flex items-center justify-center hover:bg-card-hover transition-colors font-bold text-sm text-text-primary">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Active Shipments</h3>
              <span className="text-[10px] text-accent font-semibold hover:underline cursor-pointer flex items-center">
                View All <ChevronRight size={12} />
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B0E14]/30 select-none">
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Trip ID</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Route / Destination</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Vehicle Status</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right">ETA</th>
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
                            <span className="font-semibold text-text-primary">{trip.source} ➔ {trip.destination}</span>
                            <span className="text-[10px] text-text-secondary mt-0.5">Cargo: {trip.cargoWeight} kg</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-status-available bg-status-available/10 border border-status-available/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
                            In Transit
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-text-secondary">
                          {trip.plannedDistance} km
                        </td>
                      </tr>
                    );
                  })}
                  {activeShipments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-text-secondary font-medium select-none">
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
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
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
                      <p className="text-xs font-semibold text-text-primary group-hover:text-accent truncate">{driver.name}</p>
                      <p className="text-[10px] text-text-muted font-mono mt-0.5">Expires: {driver.licenseExpiryDate}</p>
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
                <div className="text-center py-6 text-xs text-text-muted select-none">
                  All credentials up to date.
                </div>
              )}
            </div>
          </div>

          {/* Vehicles Pending Service Card */}
          <div className="bg-card border border-outline-variant rounded-xl flex flex-col p-4 space-y-3">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
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
              {getMainMaintenanceAlertVehicles(allVehicles, allMaintenance).map((v) => {
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
                        <p className="text-xs font-semibold text-text-primary group-hover:text-accent truncate">{v.regNumber}</p>
                        <p className="text-[9px] text-text-muted mt-0.5 truncate">{v.name}</p>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-wider ${
                        isOverdue ? 'bg-status-retired/10 border-status-retired/20 text-status-retired animate-pulse' : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                      }`}>
                        {isOverdue ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold text-text-secondary">
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
                <div className="text-center py-6 text-xs text-text-muted select-none">
                  All mileage levels optimal.
                </div>
              )}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-card border border-outline-variant rounded-xl flex-1 flex flex-col min-h-[450px]">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-card-hover/20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
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
                  <span className="text-[10px] text-text-secondary">2m ago</span>
                </div>
                <p className="text-xs font-bold text-text-primary mb-1">Vehicle TRK-9041 - Engine Overheating</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Driver reported sudden temperature spike near Mile Marker 42. Immediate service dispatch required.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 bg-status-retired hover:brightness-115 text-[#0B0E14] rounded text-[10px] font-bold transition-all active:scale-95">
                    Emergency Dispatch
                  </button>
                  <button className="px-3 py-1 border border-outline-variant hover:bg-card text-text-primary rounded text-[10px] font-bold transition-all">
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-4 rounded-lg border-l-4 border-accent bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-accent font-bold uppercase tracking-widest">Route Deviation</span>
                  <span className="text-[10px] text-text-secondary">14m ago</span>
                </div>
                <p className="text-xs font-bold text-text-primary mb-1">Vehicle TRK-8122 - Off Route</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Vehicle departed from planned highway path in Seattle urban sector. Possible congestion bypass.
                </p>
              </div>

              {/* Alert 3 */}
              <div className="p-4 rounded-lg border-l-4 border-status-ontrip bg-status-ontrip/5 hover:bg-status-ontrip/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-status-ontrip font-bold uppercase tracking-widest">Weather Warning</span>
                  <span className="text-[10px] text-text-secondary">42m ago</span>
                </div>
                <p className="text-xs font-bold text-text-primary mb-1">Heavy Snow - Sector 4</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Blizzard storm alert on mountain pass. Suggest rerouting all active freight lines.
                </p>
              </div>

            </div>

            <button className="m-4 py-2 text-center border border-outline-variant rounded text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:bg-card-hover transition-all">
              View All Notifications Log
            </button>
          </div>

          {/* Dispatcher Performance KPI */}
          <div className="bg-card border border-outline-variant p-5 rounded-xl space-y-4">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Dispatcher Performance</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary font-medium">Alert Response Time</span>
                  <span className="text-accent font-bold font-mono">1.2s</span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary font-medium">Optimization Efficiency</span>
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
          <div className="flex items-center gap-1.5 text-text-muted bg-border-default/20 border border-default rounded-full px-3 py-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            Reconnecting to Server...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
