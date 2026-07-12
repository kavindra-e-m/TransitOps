import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldAlert, Check, X, AlertTriangle, Trophy, LayoutList, Award, Clock } from 'lucide-react';

import { useDrivers, useAppActions } from '../context/AppContext';
import { calculateSafetyRank, getLicenseExpiryTier } from '../utils/insights';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';

// Mock system date for licensing rules
const CURRENT_DATE = new Date("2026-07-12");

const Drivers = () => {
  const drivers = useDrivers();
  const { updateDriversStatusBulk } = useAppActions();

  // Selection states
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  // Feature 2: view mode toggle
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'leaderboard'

  // Check if a license is expired
  const isLicenseExpired = (expiryDateStr) => {
    return new Date(expiryDateStr) < CURRENT_DATE;
  };

  // Toggle selection for a single driver
  const toggleSelectDriver = (id) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  // Toggle selection for all drivers
  const toggleSelectAll = () => {
    if (selectedDriverIds.length === drivers.length) {
      setSelectedDriverIds([]);
    } else {
      setSelectedDriverIds(drivers.map((d) => d.id));
    }
  };

  // Bulk status update action
  const handleBulkStatusUpdate = async (status) => {
    if (selectedDriverIds.length === 0) return;

    const hasExpiredSelected = selectedDriverIds.some((id) => {
      const driver = drivers.find((d) => d.id === id);
      return driver && isLicenseExpired(driver.licenseExpiryDate);
    });

    if (hasExpiredSelected && status === 'Available') {
      toast.error("Cannot set expired drivers to 'Available' status.");
      return;
    }

    try {
      await updateDriversStatusBulk(selectedDriverIds, status);
      toast.success(`Updated status of ${selectedDriverIds.length} driver(s) to '${status}'`);
      setSelectedDriverIds([]);
    } catch {
      // Handled
    }
  };

  const hasExpiredSelectedInSelection = selectedDriverIds.some((id) => {
    const driver = drivers.find((d) => d.id === id);
    return driver && isLicenseExpired(driver.licenseExpiryDate);
  });

  // KPI Computations
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter((d) => d.status === "Available").length;
  const onTripDrivers = drivers.filter((d) => d.status === "On Trip").length;
  const avgSafetyScore = totalDrivers > 0 ? Math.round(
    drivers.reduce((acc, d) => acc + d.safetyScore, 0) / totalDrivers
  ) : 0;

  // Safety Score Circular Progress Ring component
  const SafetyScoreCircle = ({ score }) => {
    const radius = 16;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let colorClass = "stroke-status-available";
    let textClass = "text-status-available";

    if (score < 80) {
      colorClass = "stroke-status-retired";
      textClass = "text-status-retired";
    } else if (score < 90) {
      colorClass = "stroke-status-shop";
      textClass = "text-stroke-shop";
    }

    return (
      <div className="flex items-center gap-2 select-none">
        <svg className="w-9 h-9 transform -rotate-90">
          <circle cx="18" cy="18" r={radius} className="stroke-border-default fill-transparent" strokeWidth={strokeWidth} />
          <motion.circle
            cx="18" cy="18" r={radius}
            className={`fill-transparent ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className={`font-mono text-xs font-bold ${textClass}`}>{score}</span>
      </div>
    );
  };

  // DataTable Column Definitions
  const columns = [
    {
      key: "select",
      label: "",
      width: "5%",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedDriverIds.includes(row.id)}
          onChange={() => toggleSelectDriver(row.id)}
          className="rounded border-default text-accent focus:ring-accent bg-input w-4 h-4 cursor-pointer"
        />
      )
    },
    { key: "id", label: "Driver ID", width: "10%" },
    { key: "name", label: "Driver Name" },
    { key: "licenseNumber", label: "License No", render: (row) => <span className="font-mono">{row.licenseNumber}</span> },
    { key: "licenseCategory", label: "Category" },
    {
      key: "licenseExpiryDate",
      label: "Expiry Date",
      render: (row) => {
        const { tier, daysLeft } = getLicenseExpiryTier(row.licenseExpiryDate);
        const tierConfig = {
          ok:       { cls: 'text-status-available/75', icon: null, badge: null },
          warn:     { cls: 'text-yellow-400 font-medium', icon: null, badge: null },
          critical: { cls: 'text-[#F97316] font-bold', icon: <Clock size={12} className="text-[#F97316] shrink-0" />, badge: <span className="text-[8px] bg-[#F97316]/10 border border-[#F97316]/25 text-[#F97316] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">{daysLeft} days left</span> },
          expired:  { cls: 'text-[#ffb4ab] font-bold line-through', icon: <AlertTriangle size={12} className="text-[#ffb4ab] shrink-0 animate-bounce" />, badge: <span className="text-[8px] bg-[#ffb4ab]/10 border border-[#ffb4ab]/25 text-[#ffb4ab] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">EXPIRED</span> },
        };
        const cfg = tierConfig[tier];
        return (
          <span className={`font-mono flex items-center gap-1.5 ${cfg.cls}`}>
            {cfg.icon}
            {row.licenseExpiryDate}
            {cfg.badge}
          </span>
        );
      }
    },
    { key: "contactNumber", label: "Contact No" },
    {
      key: "safetyScore",
      label: "Safety Score",
      render: (row) => <SafetyScoreCircle score={row.safetyScore} />
    },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  // ─── Feature 2: Leaderboard ────────────────────────────────────────────────

  const rankedDrivers = calculateSafetyRank(drivers);

  // Medal config for top 3
  const MEDAL_CONFIG = {
    1: { icon: <Trophy size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/25', label: 'Gold' },
    2: { icon: <Award size={16} />,  color: 'text-slate-300',  bg: 'bg-slate-300/10 border-slate-300/25',  label: 'Silver' },
    3: { icon: <Award size={16} />,  color: 'text-amber-600',  bg: 'bg-amber-600/10 border-amber-600/25',  label: 'Bronze' },
  };

  // Score bar color based on score
  const scoreBarColor = (score) => {
    if (score >= 90) return 'bg-[#51e77b]';
    if (score >= 80) return 'bg-[#F97316]';
    return 'bg-[#ffb4ab]';
  };

  // Stagger animation variants (same pattern as DataTable)
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Drivers & Safety</h2>
        <p className="text-xs text-text-secondary">Manage credentials, monitor driver safety metrics, and update active statuses.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Operators"     value={totalDrivers}    color="amber" />
        <KPICard label="Available Operators" value={availableDrivers} color="green" />
        <KPICard label="Active On Trip"      value={onTripDrivers}   color="blue" />
        <KPICard label="Average Fleet Safety" value={avgSafetyScore} suffix="%" color={avgSafetyScore >= 90 ? 'green' : 'orange'} />
      </div>

      {/* ─── View Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 select-none">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
            viewMode === 'table'
              ? 'bg-accent text-[#0B0E14] border-accent shadow-md shadow-accent/20'
              : 'bg-card border-default text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <LayoutList size={14} />
          Driver Table
        </button>
        <button
          onClick={() => setViewMode('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
            viewMode === 'leaderboard'
              ? 'bg-accent text-[#0B0E14] border-accent shadow-md shadow-accent/20'
              : 'bg-card border-default text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <Trophy size={14} />
          Safety Leaderboard
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ─── TABLE VIEW ──────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted select-none">
                {selectedDriverIds.length} driver(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-accent hover:text-accent-hover font-semibold transition-colors select-none"
              >
                {selectedDriverIds.length === drivers.length ? "Deselect All" : "Select All Drivers"}
              </button>
            </div>

            <DataTable columns={columns} data={drivers} emptyMessage="No drivers registered." />

            {/* Action Bar */}
            <AnimatePresence>
              {selectedDriverIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-5 rounded-xl border border-default bg-card shadow-2xl flex items-center justify-between flex-wrap gap-4 select-none"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-text-primary">Bulk Operations</h4>
                    <p className="text-xs text-text-secondary">
                      Set status for the {selectedDriverIds.length} selected operator(s).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative group">
                      <Button
                        variant={hasExpiredSelectedInSelection ? "secondary" : "primary"}
                        disabled={hasExpiredSelectedInSelection}
                        onClick={() => handleBulkStatusUpdate("Available")}
                        className="!px-3 !py-1.5 !text-xs"
                      >
                        <Check size={14} />
                        Available
                      </Button>
                      {hasExpiredSelectedInSelection && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-sidebar border border-default p-2 rounded text-[10px] text-status-retired leading-relaxed shadow-xl z-30">
                          <div className="flex gap-1">
                            <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                            <span>One or more selected drivers have an expired license and cannot be marked Available.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button variant="secondary" onClick={() => handleBulkStatusUpdate("Off Duty")} className="!px-3 !py-1.5 !text-xs border-default">
                      <X size={14} className="text-text-muted" />
                      Off Duty
                    </Button>

                    <Button variant="secondary" onClick={() => handleBulkStatusUpdate("Suspended")} className="!px-3 !py-1.5 !text-xs border-status-retired/30 text-status-retired hover:bg-status-retired/5 hover:border-status-retired">
                      <AlertTriangle size={14} />
                      Suspend
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── LEADERBOARD VIEW ────────────────────────────────────────── */}
        {viewMode === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-default rounded-xl overflow-hidden"
          >
            {/* Leaderboard Header */}
            <div className="px-5 py-4 border-b border-default flex items-center justify-between bg-card select-none">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Driver Safety Score Ranking
                </h3>
              </div>
              <span className="text-[10px] text-text-muted font-medium">
                {drivers.length} operators · sorted by safety score
              </span>
            </div>

            {/* Ranked Rows */}
            {rankedDrivers.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-muted">No drivers registered.</div>
            ) : (
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-default"
              >
                {rankedDrivers.map((driver) => {
                  const medal = MEDAL_CONFIG[driver.rank];

                  return (
                    <motion.li
                      key={driver.id}
                      variants={rowVariants}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors"
                    >
                      {/* Rank + Medal */}
                      <div className="w-10 flex flex-col items-center shrink-0 select-none">
                        {medal ? (
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${medal.bg} ${medal.color}`}>
                            {medal.icon}
                          </div>
                        ) : (
                          <span className="font-mono text-sm font-bold text-text-muted">#{driver.rank}</span>
                        )}
                      </div>

                      {/* Avatar Initials */}
                      <div className="w-9 h-9 rounded-full bg-sidebar border border-accent/20 flex items-center justify-center font-bold text-accent text-xs shrink-0 select-none">
                        {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Name + ID */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-text-primary truncate">{driver.name}</span>
                          {medal && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${medal.bg} ${medal.color}`}>
                              {medal.label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted font-mono">ID: DRV-{String(driver.id).padStart(3, '0')} · {driver.licenseCategory}</span>
                      </div>

                      {/* Score Bar */}
                      <div className="flex items-center gap-3 w-40 shrink-0">
                        <div className="flex-1 h-1.5 bg-input rounded-full overflow-hidden border border-default/50">
                          <motion.div
                            className={`h-full rounded-full ${scoreBarColor(driver.safetyScore)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${driver.safetyScore}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: driver.rank * 0.04 }}
                          />
                        </div>
                        <span className={`font-mono text-sm font-bold w-8 text-right shrink-0 ${
                          driver.safetyScore >= 90 ? 'text-[#51e77b]' :
                          driver.safetyScore >= 80 ? 'text-[#F97316]' : 'text-[#ffb4ab]'
                        }`}>
                          {driver.safetyScore}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <StatusBadge status={driver.status} />
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Drivers;
export { Drivers };
