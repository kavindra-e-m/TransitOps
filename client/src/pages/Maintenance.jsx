import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Wrench, AlertCircle, CheckCircle2, ChevronRight, AlertTriangle, X } from 'lucide-react';

import { useMaintenance, useVehicles, useAppActions } from '../context/AppContext';
import { getPredictiveMaintenance } from '../utils/insights';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Maintenance = () => {
  const logs = useMaintenance();
  const vehicles = useVehicles();
  const { addMaintenanceRecord, closeMaintenanceRecord } = useAppActions();

  // Selection states
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'required'

  // Animation layout triggers
  const [transitionEffect, setTransitionEffect] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    vehicleId: "",
    serviceType: "Routine Inspection",
    cost: "",
    date: new Date().toISOString().split('T')[0],
    status: "Active"
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseRecord = async (recordId) => {
    try {
      setTransitionEffect("to-available");
      await closeMaintenanceRecord(recordId);
      toast.success("Maintenance record marked as Closed.");
      setSelectedLogId(null);
    } catch {
      // toast shown automatically
    } finally {
      setTimeout(() => setTransitionEffect(null), 1000);
    }
  };

  // Local Form Validation
  const validate = () => {
    const errors = {};
    if (!formValues.vehicleId) errors.vehicleId = "Please select a vehicle";
    if (!formValues.serviceType.trim()) errors.serviceType = "Service type description is required";
    if (!formValues.cost || isNaN(formValues.cost) || Number(formValues.cost) <= 0) {
      errors.cost = "Must be a positive cost ($)";
    }
    if (!formValues.date) errors.date = "Valid date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setTransitionEffect("to-shop");
      await addMaintenanceRecord(formValues);
      toast.success("Maintenance record logged. Vehicle status updated to 'In Shop'");
      
      // Reset form
      setFormValues({
        vehicleId: "",
        serviceType: "Routine Inspection",
        cost: "",
        date: new Date().toISOString().split('T')[0],
        status: "Active"
      });
      setFormErrors({});
      setIsModalOpen(false);
    } catch {
      // interceptors
    } finally {
      setTimeout(() => setTransitionEffect(null), 1000);
    }
  };

  // Table Column Definitions
  const columns = [
    { key: "id", label: "Log ID", width: "10%" },
    { 
      key: "vehicleId", 
      label: "Vehicle", 
      render: (row) => {
        const vehicle = vehicles.find(v => v.id === Number(row.vehicleId));
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{vehicle ? vehicle.regNumber : row.vehicleId}</span>
            <span className="text-[10px] text-text-secondary mt-0.5">{vehicle ? vehicle.name : ''}</span>
          </div>
        );
      } 
    },
    { key: "serviceType", label: "Service Description" },
    { key: "cost", label: "Cost ($)", render: (row) => <span className="font-mono">${row.cost.toLocaleString()}</span> },
    { key: "date", label: "Date Scheduled", render: (row) => <span className="font-mono">{row.date}</span> },
    { key: "status", label: "Log Status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  // Selected Log detail mapping
  const selectedLogObj = logs.find(l => l.id === selectedLogId) || null;
  const activeLogsCount = logs.filter(l => l.status === "Active").length;
  const totalCostMaintenance = logs.reduce((acc, l) => acc + l.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Maintenance Scheduling</h2>
          <p className="text-xs text-text-secondary">Log vehicle servicing events, schedule repairs, and release vehicles to service.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Log Maintenance
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Total Repairs Logged" value={logs.length} color="amber" />
        <KPICard label="Active In Shop" value={activeLogsCount} color="orange" />
        <KPICard label="Total Fleet Spendings" value={`$${totalCostMaintenance.toLocaleString()}`} color="red" />
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 select-none">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
            activeTab === 'logs'
              ? 'bg-accent text-[#0B0E14] border-accent shadow-md shadow-accent/20'
              : 'bg-card border-default text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <Wrench size={14} />
          Service Logs
        </button>
        <button
          onClick={() => setActiveTab('required')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 relative ${
            activeTab === 'required'
              ? 'bg-accent text-[#0B0E14] border-accent shadow-md shadow-accent/20'
              : 'bg-card border-default text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <AlertTriangle size={14} />
          Service Required
          {vehicles.filter(v => getPredictiveMaintenance(v, logs).status !== 'ok').length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-retired opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-retired"></span>
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'logs' && (
          <motion.div
            key="logs-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Interactive SVG Diagram representing vehicle status transition */}
            <div className="bg-card border border-default p-6 rounded-xl flex items-center justify-center flex-col md:flex-row gap-8 select-none shadow-sm relative overflow-hidden">
              {/* Left State: Available */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-status-available/10 text-status-available border border-status-available/20 flex items-center justify-center shadow-lg shadow-status-available/5">
                  <CheckCircle2 size={32} />
                </div>
                <span className="text-xs font-semibold text-text-primary">Available</span>
                <span className="text-[10px] text-text-secondary text-center max-w-[120px]">Ready for dispatch on active trips.</span>
              </div>

              {/* Transition Arrows & Logs animation */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-xs py-4">
                <svg className="w-full h-12 text-border-default overflow-visible" fill="none">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 2 L 8 5 L 0 8 z" fill="currentColor"/>
                    </marker>
                  </defs>
                  {/* Top Path: Dispatch to Maintenance (Active) */}
                  <path d="M 10,12 Q 130,-5 250,12" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
                  {/* Bottom Path: Release to Available (Completed) */}
                  <path d="M 250,32 Q 130,48 10,32" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />

                  {/* Glowing moving dot indicators on transition action */}
                  {transitionEffect === 'to-shop' && (
                    <motion.circle r="4" fill="#F97316"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{ motionPath: "path('M 10,12 Q 130,-5 250,12')" }}
                    />
                  )}
                  {transitionEffect === 'to-available' && (
                    <motion.circle r="4" fill="#22C55E"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{ motionPath: "path('M 250,32 Q 130,48 10,32')" }}
                    />
                  )}
                </svg>
                <span className="text-[10px] text-text-muted mt-2 font-mono flex items-center gap-1">
                  Status Transition Telemetry
                </span>
              </div>

              {/* Right State: In Shop */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-status-shop/10 text-status-shop border border-status-shop/20 flex items-center justify-center shadow-lg shadow-status-shop/5">
                  <AlertCircle size={32} />
                </div>
                <span className="text-xs font-semibold text-text-primary">In Shop</span>
                <span className="text-[10px] text-text-secondary text-center max-w-[120px]">Undergoing routine repairs and maintenance.</span>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={logs}
              onRowClick={(row) => setSelectedLogId(row.id)}
              emptyMessage="No maintenance entries scheduled."
            />
          </motion.div>
        )}

        {activeTab === 'required' && (
          <motion.div
            key="required-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {vehicles.filter(v => getPredictiveMaintenance(v, logs).status !== 'ok').map((v) => {
              const { status, kmSince, lastServiceDate } = getPredictiveMaintenance(v, logs);
              const percent = Math.min(Math.round((kmSince / 5000) * 100), 100);
              
              return (
                <div key={v.id} className="bg-card border border-default rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-all select-none">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{v.regNumber}</h4>
                        <p className="text-xs text-text-secondary">{v.name}</p>
                      </div>
                      {status === 'overdue' ? (
                        <span className="bg-status-retired/10 border border-status-retired/25 text-status-retired px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Overdue ({kmSince.toLocaleString()} km)
                        </span>
                      ) : (
                        <span className="bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Due Soon ({kmSince.toLocaleString()} km)
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-medium">
                        <span className="text-text-muted">Threshold Progress</span>
                        <span className={`${status === 'overdue' ? 'text-status-retired' : 'text-yellow-400'}`}>{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-default/50">
                        <div
                          className={`h-full rounded-full ${status === 'overdue' ? 'bg-status-retired' : 'bg-yellow-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-text-muted">
                        {lastServiceDate ? `Last service date: ${lastServiceDate}` : "No service logs found."}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setFormValues((prev) => ({ ...prev, vehicleId: String(v.id) }));
                      setIsModalOpen(true);
                    }}
                    className="w-full mt-4 !py-1.5 !text-xs"
                  >
                    Schedule Service
                  </Button>
                </div>
              );
            })}
            {vehicles.filter(v => getPredictiveMaintenance(v, logs).status !== 'ok').length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-text-muted bg-card border border-default rounded-xl">
                All vehicles are below the service requirement threshold.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Maintenance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Schedule Vehicle Maintenance"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          
          {/* Vehicle Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Vehicle for Service
            </label>
            <select
              name="vehicleId"
              value={formValues.vehicleId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
            >
              <option value="">-- Select Fleet Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} — {v.name} ({v.status})
                </option>
              ))}
            </select>
            {formErrors.vehicleId && <p className="text-[10px] text-status-retired font-medium">{formErrors.vehicleId}</p>}
          </div>

          <Input
            label="Service / Repair Description"
            name="serviceType"
            value={formValues.serviceType}
            onChange={handleInputChange}
            error={formErrors.serviceType}
            placeholder="e.g. Brake Pads Replacement & Alignment"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Cost ($)"
              name="cost"
              value={formValues.cost}
              onChange={handleInputChange}
              error={formErrors.cost}
              placeholder="e.g. 350"
              type="number"
            />
            <Input
              label="Service Date"
              name="date"
              value={formValues.date}
              onChange={handleInputChange}
              error={formErrors.date}
              type="date"
            />
          </div>

          {/* Status dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Initial Status
            </label>
            <select
              name="status"
              value={formValues.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
            >
              <option value="Active">Active (In Shop)</option>
              <option value="Closed">Closed (Released)</option>
            </select>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-default select-none">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule Log</Button>
          </div>
        </form>
      </Modal>

      {/* Details side Drawer */}
      <AnimatePresence>
        {selectedLogObj && (
          <div className="fixed inset-0 z-40 flex justify-end font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLogId(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-w-md h-full bg-sidebar border-l border-default p-6 shadow-2xl flex flex-col overflow-hidden text-text-primary"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-default pb-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold">Service Log Detail</h3>
                  <span className="font-mono text-xs text-text-secondary select-all">Log #{selectedLogObj.id}</span>
                </div>
                <button
                  onClick={() => setSelectedLogId(null)}
                  className="text-text-muted hover:text-text-primary rounded-md p-1 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Details Content */}
              <div className="space-y-6">
                
                {/* Status card */}
                <div className="bg-card border border-default p-4 rounded-xl flex justify-between items-center select-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Status</span>
                  <StatusBadge status={selectedLogObj.status} />
                </div>

                <div className="space-y-4">
                  {/* Service Description */}
                  <div className="bg-card p-3.5 rounded-lg border border-default">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Service type</span>
                    <span className="font-bold mt-1.5 block text-xs">{selectedLogObj.serviceType}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Cost */}
                    <div className="bg-card p-3.5 rounded-lg border border-default">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Cost</span>
                      <span className="font-mono font-bold mt-1 block text-sm">${selectedLogObj.cost.toLocaleString()}</span>
                    </div>
                    {/* Date */}
                    <div className="bg-card p-3.5 rounded-lg border border-default">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Service Date</span>
                      <span className="font-mono font-bold mt-1 block text-sm">{selectedLogObj.date}</span>
                    </div>
                  </div>
                </div>

                {/* Release/Close Action button */}
                {selectedLogObj.status === 'Active' && (
                  <Button
                    onClick={() => handleCloseRecord(selectedLogObj.id)}
                    className="w-full mt-6"
                  >
                    Release Vehicle (Mark Closed)
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maintenance;
export { Maintenance };
