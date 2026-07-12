import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Shield, Settings as SettingsIcon, Check, Minus, Lock, User, Info, Eye, Edit } from 'lucide-react';

import { getSettingsAPI, updateSettingsAPI, getRbacMatrixAPI } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../config/permissions';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ROLE_COLOR = {
  'Fleet Manager':     'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
  'Driver':            'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20',
  'Safety Officer':    'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  'Financial Analyst': 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20',
};

const Settings = () => {
  const { user, role } = useAuth();

  // General settings state
  const [depotName, setDepotName] = useState('Central Depot');
  const [currency, setCurrency] = useState('USD');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [savingSettings, setSavingSettings] = useState(false);

  // RBAC Matrix state
  const [rbacMatrix, setRbacMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  // Available roles for column rendering (must match PERMISSIONS keys)
  const rolesList = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

  // My access modules derived from frontend permissions config
  const myPermissions = PERMISSIONS[role] || {};
  const moduleLabels = {
    dashboard:    'Fleet Dashboard',
    fleet:        'Fleet Registry',
    drivers:      'Drivers Registry',
    trips:        'Route Optimizer',
    maintenance:  'Maintenance Logs',
    fuelExpenses: 'Fuel & Expenses',
    analytics:    'Fleet Analytics',
    settings:     'System Settings',
  };

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
      <div className="flex h-64 items-center justify-center text-sm text-secondary select-none">
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
        <h2 className="text-xl font-bold text-primary">System Settings</h2>
        <p className="text-xs text-secondary">Configure general depot parameters and audit Role-Based Access Control (RBAC) permissions.</p>
      </div>

      {/* Top Row: User Profile + System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* User Profile Card */}
        <div className="bg-card rounded-xl border border-default p-6 space-y-4 select-none">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-default pb-2.5 flex items-center gap-2">
            <User size={16} className="text-accent" />
            User Profile
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-accent select-none">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{user?.name ?? '—'}</p>
              <p className="text-xs text-muted truncate">{user?.email ?? '—'}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLOR[role] ?? 'text-muted bg-card border-default'}`}>
                {role ?? 'Unknown Role'}
              </span>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        <div className="bg-card rounded-xl border border-default p-6 space-y-4 select-none">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-default pb-2.5 flex items-center gap-2">
            <Info size={16} className="text-accent" />
            System Information
          </h3>
          <dl className="space-y-2.5">
            {[
              { label: 'Application',  value: 'TransitOps Fleet Manager' },
              { label: 'Version',      value: 'v1.0.0' },
              { label: 'Stack',        value: 'React + Node/Express + SQLite' },
              { label: 'Auth',         value: 'JWT — Session in memory' },
              { label: 'Data Polling', value: 'Every 20 seconds' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="text-xs text-muted shrink-0">{label}</dt>
                <dd className="text-xs font-semibold text-primary text-right truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

      </div>



      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: General Settings (4/12 width) */}
        <form onSubmit={handleSaveSettings} className="xl:col-span-4 p-6 rounded-xl border border-default bg-card space-y-4 select-none">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-default pb-2.5 mb-2 flex items-center gap-2">
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
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-input text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            {/* Distance Unit Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Distance Unit
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full px-3 py-2 bg-input text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Shield size={16} className="text-accent" />
              Role Permissions Matrix
            </h3>
            <span className="text-[10px] text-muted font-bold flex items-center gap-1">
              <Lock size={10} />
              Read-Only Configurations
            </span>
          </div>

          {/* RBAC Matrix Table */}
          <div className="w-full overflow-x-auto rounded-lg border border-default">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-primary/40 border-b border-default text-[10px] font-bold text-secondary uppercase tracking-wider">
              <th className="p-3 font-semibold w-[35%]">Capability</th>
                  {rolesList.map(r => (
                    <th key={r} className={`p-3 text-center font-semibold ${r === role ? 'text-accent' : ''}`}>
                      {r}
                      {r === role && <span className="ml-1 text-[8px] bg-accent/10 text-accent border border-accent/20 px-1 py-0.5 rounded-full">You</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-default font-sans">
                {capabilities.map((cap) => (
                  <tr key={cap.key} className="hover:bg-card-hover/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-primary">{cap.label}</div>
                      <div className="text-[10px] text-muted mt-0.5">{cap.desc}</div>
                    </td>
                    
                    {rolesList.map((r) => {
                      const allowed = rbacMatrix[r]?.includes(cap.key) ||
                                      rbacMatrix[r]?.includes(cap.key.replace('manage_', 'view_')) ||
                                      (cap.key.startsWith('view_') && rbacMatrix[r]?.includes(cap.key.replace('view_', 'manage_')));
                      return (
                        <td key={r} className={`p-3 text-center align-middle ${r === role ? 'bg-accent/5' : ''}`}>
                          <div className="flex items-center justify-center">
                            {allowed ? (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                                r === role
                                  ? 'bg-accent/20 text-accent border border-accent/30'
                                  : 'bg-status-available/10 text-status-available border border-status-available/20'
                              }`}>
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-border-default/20 text-muted border border-default flex items-center justify-center">
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

      {/* My Access Summary Card — live from frontend permissions config */}
      <div className="p-6 rounded-xl border border-default bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-default pb-2.5 mb-2 select-none">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Lock size={16} className="text-accent" />
            My Module Access
          </h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${ROLE_COLOR[role] ?? 'text-muted bg-card border-default'}`}>
            {role}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(myPermissions).map(([module, level]) => (
            <div
              key={module}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                level === 'edit' ? 'bg-status-available/5 border-status-available/20' :
                level === 'view' ? 'bg-accent/5 border-accent/15' :
                'bg-status-retired/5 border-status-retired/20'
              }`}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{moduleLabels[module] || module}</p>
              <div className="flex items-center gap-1 mt-1">
                {level === 'edit' && <><Edit size={10} className="text-status-available shrink-0" /><span className="font-bold text-status-available">Full Edit</span></>}
                {level === 'view' && <><Eye size={10} className="text-accent shrink-0" /><span className="font-bold text-accent">View Only</span></>}
                {level === 'none' && <><Minus size={10} className="text-status-retired shrink-0" /><span className="font-bold text-status-retired">No Access</span></>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
export { Settings };

