import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Wrench, Calendar, DollarSign, CheckCircle, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

import { useVehicles, useMaintenance, useAppActions } from '../context/AppContext';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Maintenance = () => {
  const vehicles = useVehicles();
  const maintenance = useMaintenance();
  const { addMaintenanceRecord, closeMaintenanceRecord } = useAppActions();

  // Form States
  const [formValues, setFormValues] = useState({
    vehicleId: "",
    serviceType: "",
    cost: "",
    date: new Date().toISOString().split('T')[0],
    status: "Active"
  });
  const [formErrors, setFormErrors] = useState({});

  // Transition Flash States for SVG Diagram
  // Options: 'to-shop' | 'to-available' | null
  const [transitionFlash, setTransitionFlash] = useState(null);

  // Trigger flash animation helper
  const triggerTransition = (type) => {
    setTransitionFlash(type);
    const timer = setTimeout(() => {
      setTransitionFlash(null);
    }, 1500); // Animation duration
    return () => clearTimeout(timer);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    const errors = {};
    if (!formValues.vehicleId) errors.vehicleId = "Please select a vehicle";
    if (!formValues.serviceType.trim()) errors.serviceType = "Service type is required";
    if (!formValues.cost || isNaN(formValues.cost) || Number(formValues.cost) <= 0) {
      errors.cost = "Cost must be a positive number";
    }
    if (!formValues.date) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please complete the service form.");
      return;
    }

    // Call context action
    addMaintenanceRecord(formValues);
    toast.success(`Maintenance record logged successfully.`);

    // Trigger SVG Flow transition flash
    if (formValues.status === 'Active') {
      triggerTransition('to-shop');
    }

    // Reset Form
    setFormValues({
      vehicleId: "",
      serviceType: "",
      cost: "",
      date: new Date().toISOString().split('T')[0],
      status: "Active"
    });
  };

  const handleCloseRecord = (recordId) => {
    closeMaintenanceRecord(recordId);
    toast.success("Maintenance record marked as Closed. Vehicle returned to fleet.");
    triggerTransition('to-available');
  };

  // KPI Calculations
  const activeRecordsCount = maintenance.filter(m => m.status === 'Active').length;
  const totalSpend = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const vehiclesInShopCount = vehicles.filter(v => v.status === 'In Shop').length;

  // DataTable Column Definitions
  const columns = [
    { key: "id", label: "Log ID", width: "10%" },
    { 
      key: "vehicleId", 
      label: "Vehicle", 
      render: (row) => {
        const vehicle = vehicles.find(v => v.id === row.vehicleId);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{vehicle ? vehicle.regNumber : row.vehicleId}</span>
            <span className="text-[10px] text-text-muted">{vehicle ? vehicle.name : ''}</span>
          </div>
        );
      }
    },
    { key: "serviceType", label: "Service Rendered" },
    { key: "cost", label: "Cost ($)", render: (row) => <span className="font-mono">${row.cost.toLocaleString()}</span> },
    { key: "date", label: "Date", render: (row) => <span className="font-mono">{row.date}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { 
      key: "actions", 
      label: "Actions", 
      width: "15%",
      render: (row) => {
        if (row.status === 'Active') {
          return (
            <Button
              variant="secondary"
              onClick={() => handleCloseRecord(row.id)}
              className="!px-2.5 !py-1 !text-[10px] !h-7 border-status-available/30 text-status-available hover:bg-status-available/5 hover:border-status-available"
            >
              <CheckCircle size={12} />
              Close Log
            </Button>
          );
        }
        return <span className="text-xs text-text-muted">Completed</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Maintenance Log</h2>
        <p className="text-xs text-text-secondary">Register repair records, assign active workshop jobs, and review historical shop costs.</p>
      </div>

      {/* KPI Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard label="Active Workshop Logs" value={activeRecordsCount} color="orange" />
        <KPICard label="Fleet Maintenance Spend" value={totalSpend} prefix="$" color="amber" />
        <KPICard label="Vehicles Currently In Shop" value={vehiclesInShopCount} color="red" />
      </div>

      {/* Main Grid: Form Left, Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 p-6 rounded-xl border border-default bg-card space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-2.5 mb-2 flex items-center gap-2 select-none">
            <Wrench size={16} className="text-accent" />
            Log Service Record
          </h3>

          {/* Vehicle Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Assign Vehicle
            </label>
            <select
              name="vehicleId"
              value={formValues.vehicleId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border focus:outline-none focus:border-border-focus transition-all duration-200 
                ${formErrors.vehicleId ? 'border-status-retired' : 'border-default'}
              `}
            >
              <option value="">Select Vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} — {v.name} ({v.status})
                </option>
              ))}
            </select>
            {formErrors.vehicleId && (
              <p className="text-[10px] text-status-retired mt-0.5">{formErrors.vehicleId}</p>
            )}
          </div>

          <Input
            label="Service Rendered"
            name="serviceType"
            value={formValues.serviceType}
            onChange={handleInputChange}
            error={formErrors.serviceType}
            placeholder="e.g. Engine tune-up, brake overhaul"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Service Cost ($)"
              name="cost"
              value={formValues.cost}
              onChange={handleInputChange}
              error={formErrors.cost}
              placeholder="e.g. 750"
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

          {/* Status Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Initial Job Status
            </label>
            <select
              name="status"
              value={formValues.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
            >
              <option value="Active">Active (Vehicle sent to Shop)</option>
              <option value="Closed">Closed (Completed log only)</option>
            </select>
          </div>

          <Button type="submit" className="w-full mt-2">
            Log Service Record
          </Button>
        </form>

        {/* Right Column: Log Table */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-2.5 select-none">
            Active & Closed Service Logs
          </h3>

          <DataTable
            columns={columns}
            data={maintenance}
            emptyMessage="No service logs recorded."
          />
        </div>
      </div>

      {/* Status Flow Diagram (Animated SVG/HTML showing transitions) */}
      <div className="p-6 rounded-xl border border-default bg-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6 flex items-center gap-2 select-none">
          <CheckCircle size={14} className="text-accent" />
          Vehicle Status State-Flow Diagram
        </h3>

        <div className="flex flex-col items-center justify-center py-4 bg-bg-primary/20 rounded-xl border border-default/50 max-w-2xl mx-auto relative select-none">
          <div className="flex items-center justify-between w-full max-w-md relative z-10 px-6">
            
            {/* Available State Node */}
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-14 h-14 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E] flex items-center justify-center shadow-lg shadow-[#22C55E]/5"
                animate={transitionFlash === 'to-available' ? { scale: [1, 1.15, 1], boxShadow: ["0 0 10px rgba(34,197,94,0.1)", "0 0 25px rgba(34,197,94,0.5)", "0 0 10px rgba(34,197,94,0.1)"] } : {}}
                transition={{ duration: 1 }}
              >
                <div className="w-4 h-4 rounded-full bg-[#22C55E]" />
              </motion.div>
              <span className="text-[11px] font-semibold mt-2 text-[#22C55E] uppercase tracking-wider">Available</span>
            </div>

            {/* In Shop State Node */}
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-14 h-14 rounded-full bg-[#F97316]/10 border-2 border-[#F97316] flex items-center justify-center shadow-lg shadow-[#F97316]/5"
                animate={transitionFlash === 'to-shop' ? { scale: [1, 1.15, 1], boxShadow: ["0 0 10px rgba(249,115,22,0.1)", "0 0 25px rgba(249,115,22,0.5)", "0 0 10px rgba(249,115,22,0.1)"] } : {}}
                transition={{ duration: 1 }}
              >
                <div className="w-4 h-4 rounded-full bg-[#F97316]" />
              </motion.div>
              <span className="text-[11px] font-semibold mt-2 text-[#F97316] uppercase tracking-wider font-sans">In Shop</span>
            </div>

          </div>

          {/* SVG Connector Lines and Text */}
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full max-w-md" viewBox="0 0 400 160">
              {/* Arrow from Available to In Shop (Top half curve) */}
              <g>
                <motion.path
                  d="M 85,60 Q 200,10 315,60"
                  fill="none"
                  stroke={transitionFlash === 'to-shop' ? '#F97316' : '#1F2937'}
                  strokeWidth={transitionFlash === 'to-shop' ? 3 : 1.5}
                  animate={transitionFlash === 'to-shop' ? { strokeDasharray: ["0,10", "150,10"], stroke: ["#1F2937", "#F97316", "#1F2937"] } : {}}
                  transition={{ duration: 1.5 }}
                />
                <polygon points="315,60 305,53 309,61" fill={transitionFlash === 'to-shop' ? '#F97316' : '#1F2937'} />
                {transitionFlash === 'to-shop' && (
                  <motion.circle
                    r="4"
                    fill="#F97316"
                    initial={{ offset: 0 }}
                    animate={{ cx: [85, 200, 315], cy: [60, 20, 60] }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                )}
                <text x="200" y="32" textAnchor="middle" className={`text-[9px] font-bold uppercase tracking-wider ${transitionFlash === 'to-shop' ? 'fill-[#F97316] font-semibold' : 'fill-text-muted'}`}>
                  Log Active Service
                </text>
              </g>

              {/* Arrow from In Shop back to Available (Bottom half curve) */}
              <g>
                <motion.path
                  d="M 315,100 Q 200,150 85,100"
                  fill="none"
                  stroke={transitionFlash === 'to-available' ? '#22C55E' : '#1F2937'}
                  strokeWidth={transitionFlash === 'to-available' ? 3 : 1.5}
                  animate={transitionFlash === 'to-available' ? { strokeDasharray: ["0,10", "150,10"], stroke: ["#1F2937", "#22C55E", "#1F2937"] } : {}}
                  transition={{ duration: 1.5 }}
                />
                <polygon points="85,100 95,107 91,99" fill={transitionFlash === 'to-available' ? '#22C55E' : '#1F2937'} />
                {transitionFlash === 'to-available' && (
                  <motion.circle
                    r="4"
                    fill="#22C55E"
                    animate={{ cx: [315, 200, 85], cy: [100, 140, 100] }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                )}
                <text x="200" y="142" textAnchor="middle" className={`text-[9px] font-bold uppercase tracking-wider ${transitionFlash === 'to-available' ? 'fill-[#22C55E] font-semibold' : 'fill-text-muted'}`}>
                  Close Log Record
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
export { Maintenance };
