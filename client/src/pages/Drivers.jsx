import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

import { useDrivers, useAppActions } from '../context/AppContext';
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

    // Safety check: is any selected driver expired, and are we setting status to Available?
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
      setSelectedDriverIds([]); // Clear selection
    } catch {
      // Handled
    }
  };

  // Helper to check if "Available" toggle should be disabled for current selection
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

    let colorClass = "stroke-status-available"; // >= 90
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
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="stroke-border-default fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx="18"
            cy="18"
            r={radius}
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
        const expired = isLicenseExpired(row.licenseExpiryDate);
        return (
          <span className={`font-mono flex items-center gap-1.5 ${expired ? 'text-status-retired font-semibold' : ''}`}>
            {row.licenseExpiryDate}
            {expired && <AlertTriangle size={12} className="text-status-retired shrink-0 animate-bounce" />}
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Drivers & Safety</h2>
        <p className="text-xs text-text-secondary">Manage credentials, monitor driver safety metrics, and update active statuses.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Operators" value={totalDrivers} color="amber" />
        <KPICard label="Available Operators" value={availableDrivers} color="green" />
        <KPICard label="Active On Trip" value={onTripDrivers} color="blue" />
        <KPICard label="Average Fleet Safety" value={avgSafetyScore} suffix="%" color={avgSafetyScore >= 90 ? 'green' : 'orange'} />
      </div>

      {/* Data Table section */}
      <div className="space-y-3">
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

        <DataTable
          columns={columns}
          data={drivers}
          emptyMessage="No drivers registered."
        />
      </div>

      {/* Action Bar (Status toggle control below table) */}
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
              {/* Available Toggle */}
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

              {/* Off Duty Toggle */}
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusUpdate("Off Duty")}
                className="!px-3 !py-1.5 !text-xs border-default"
              >
                <X size={14} className="text-text-muted" />
                Off Duty
              </Button>

              {/* Suspended Toggle */}
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusUpdate("Suspended")}
                className="!px-3 !py-1.5 !text-xs border-status-retired/30 text-status-retired hover:bg-status-retired/5 hover:border-status-retired"
              >
                <AlertTriangle size={14} />
                Suspend
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Drivers;
export { Drivers };
