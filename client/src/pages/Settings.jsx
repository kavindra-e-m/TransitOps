import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Shield, Settings as SettingsIcon, Check, Minus, Lock, CheckCircle2 } from 'lucide-react';

import { getSettingsAPI, updateSettingsAPI, getRbacMatrixAPI } from '../api/settings';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Settings = () => {
  // General settings state
  const [depotName, setDepotName] = useState('Central Depot');
  const [currency, setCurrency] = useState('USD');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [savingSettings, setSavingSettings] = useState(false);

  // RBAC Matrix state
  const [rbacMatrix, setRbacMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  // Available roles for column rendering
  const rolesList = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

  // Static list of unique capabilities to map against the roles' lists
  const capabilities = [
    { key: "manage_vehicles", label: "Manage Vehicles CRUD", desc: "Register, modify, or retire vehicles" },
    { key: "view_vehicles", label: "View Fleet Registry", desc: "List details and search vehicle histories" },
    { key: "manage_drivers", label: "Manage Drivers CRUD", desc: "Hire, update, and suspend operators" },
    { key: "view_drivers", label: "View Operator Safety Data", desc: "Audit safety scores and credentials" },
    { key: "dispatch_trips", label: "Dispatch Trips State-Machine", desc: "Create, start, or cancel logistics dispatches" },
    { key: "manage_maintenance", label: "Log & Close Maintenance", desc: "Send vehicles in shop or clear them" },
    { key: "manage_expenses", label: "Record Fuel Refills & Expenses", desc: "Log spendings and view operational costs" },
    { key: "view_analytics", label: "View Financial & ROI Analytics", desc: "Access Recharts bar charts and CSV exports" },
    { key: "manage_settings", label: "Configure Depot Options", desc: "Edit currency, system metrics and RBAC configurations" }
  ];

  // Fetch settings & RBAC configs on mount
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const [settingsData, rbacData] = await Promise.all([
          getSettingsAPI(),
          getRbacMatrixAPI()
        ]);
        setDepotName(settingsData.depotName || 'Central Depot');
        setCurrency(settingsData.currency || 'USD');
        setDistanceUnit(settingsData.distanceUnit || 'km');
        setRbacMatrix(rbacData);
      } catch (err) {
        console.error("Failed to load settings data", err);
        toast.error("Failed to load system settings from backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettingsAPI({ depotName, currency, distanceUnit });
      toast.success("Depot general settings saved successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update general settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary select-none">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Loading system configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">System Settings</h2>
        <p className="text-xs text-text-secondary">Configure general depot parameters and audit Role-Based Access Control (RBAC) permissions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: General Settings (4/12 width) */}
        <form onSubmit={handleSaveSettings} className="xl:col-span-4 p-6 rounded-xl border border-default bg-card space-y-4 select-none">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-2.5 mb-2 flex items-center gap-2">
            <SettingsIcon size={16} className="text-accent" />
            General Configurations
          </h3>

          <Input
            label="Depot Name"
            value={depotName}
            onChange={(e) => setDepotName(e.target.value)}
            placeholder="e.g. Central Logistics Terminal"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Currency Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            {/* Distance Unit Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Distance Unit
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={savingSettings} className="w-full mt-2">
            {savingSettings ? "Saving Settings..." : "Save Depot Settings"}
          </Button>
        </form>

        {/* Right Column: RBAC Matrix (8/12 width) */}
        <div className="xl:col-span-8 p-6 rounded-xl border border-default bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-2.5 mb-2 select-none">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Shield size={16} className="text-accent" />
              Role Permissions Matrix
            </h3>
            <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
              <Lock size={10} />
              Read-Only Configurations
            </span>
          </div>

          {/* RBAC Matrix Table */}
          <div className="w-full overflow-x-auto rounded-lg border border-default">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-bg-primary/40 border-b border-default text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  <th className="p-3 font-semibold w-[35%]">Capability</th>
                  {rolesList.map(role => (
                    <th key={role} className="p-3 text-center font-semibold">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-default font-sans">
                {capabilities.map((cap) => (
                  <tr key={cap.key} className="hover:bg-card-hover/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-text-primary">{cap.label}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{cap.desc}</div>
                    </td>
                    
                    {rolesList.map((role) => {
                      // Check permissions
                      const allowed = rbacMatrix[role]?.includes(cap.key) || 
                                      rbacMatrix[role]?.includes(cap.key.replace('manage_', 'view_')) ||
                                      (cap.key.startsWith('view_') && rbacMatrix[role]?.includes(cap.key.replace('view_', 'manage_')));
                      
                      const isManager = role === 'Fleet Manager';
                      
                      return (
                        <td key={role} className="p-3 text-center align-middle">
                          <div className="flex items-center justify-center">
                            {allowed ? (
                              <div className="w-5 h-5 rounded-full bg-status-available/10 text-status-available border border-status-available/20 flex items-center justify-center font-bold">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-border-default/20 text-text-muted border border-default flex items-center justify-center">
                                <Minus size={11} strokeWidth={2} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
export { Settings };
