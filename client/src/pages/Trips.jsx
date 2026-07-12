import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Plus, Route, MapPin, Compass, AlertTriangle, ShieldAlert,
  ChevronRight, Calendar, User, Truck, HelpCircle, X, GitBranch
} from 'lucide-react';

import { 
  useVehicles, useDrivers, useTrips, useAppActions, useMaintenance, useExpenses
} from '../context/AppContext';
import { scoreVehicles, scoreDrivers } from '../utils/insights';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TripTimeline from '../components/common/Timeline';

const STEP_INFOS = [
  { step: 1, title: "Origin & Dest.", desc: "Route mapping" },
  { step: 2, title: "Cargo & Load", desc: "Weight constraints" },
  { step: 3, title: "Vehicle & Operator", desc: "Dispatch assignment" }
];

const Trips = () => {
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const trips = useTrips();
  const maintenance = useMaintenance();
  const expenses = useExpenses();
  
  const { dispatchTrip, completeTrip, cancelTrip } = useAppActions();

  // Selection states
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stepper Forms State
  const [activeStep, setActiveStep] = useState(1);
  const [formValues, setFormValues] = useState({
    source: "",
    destination: "",
    plannedDistance: "",
    cargoWeight: "",
    vehicleId: "",
    driverId: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Override standard select view toggles
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  // Filter list of available vehicles/drivers (only Available and unexpired)
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'Available');
  }, [drivers]);

  // Ranked recommendation lists
  const recommendedVehicles = useMemo(() => {
    if (activeStep !== 3 || !formValues.cargoWeight) return [];
    return scoreVehicles(
      vehicles,
      maintenance,
      expenses,
      trips,
      Number(formValues.cargoWeight)
    );
  }, [activeStep, vehicles, maintenance, expenses, trips, formValues.cargoWeight]);

  const recommendedDrivers = useMemo(() => {
    if (activeStep !== 3) return [];
    return scoreDrivers(drivers);
  }, [activeStep, drivers]);

  // Auto-select top recommendation on reaching Step 3
  useEffect(() => {
    if (activeStep === 3) {
      const topVeh = recommendedVehicles[0]?.vehicle;
      const topDrv = recommendedDrivers[0]?.driver;
      setFormValues(prev => ({
        ...prev,
        vehicleId: prev.vehicleId || (topVeh ? String(topVeh.id) : ""),
        driverId: prev.driverId || (topDrv ? String(topDrv.id) : "")
      }));
    }
  }, [activeStep, recommendedVehicles, recommendedDrivers]);

  // Find selected objects inside the form
  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.id === Number(formValues.vehicleId)) || null;
  }, [vehicles, formValues.vehicleId]);

  const selectedDriverObj = useMemo(() => {
    return drivers.find(d => d.id === Number(formValues.driverId)) || null;
  }, [drivers, formValues.driverId]);

  // Capacity overload check
  const isOverloaded = useMemo(() => {
    if (!selectedVehicleObj || !formValues.cargoWeight) return false;
    return Number(formValues.cargoWeight) > selectedVehicleObj.maxLoadCapacity;
  }, [selectedVehicleObj, formValues.cargoWeight]);

  // Validation functions
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formValues.source.trim()) errors.source = "Origin starting point is required";
      if (!formValues.destination.trim()) errors.destination = "Destination is required";
      if (!formValues.plannedDistance || isNaN(formValues.plannedDistance) || Number(formValues.plannedDistance) <= 0) {
        errors.plannedDistance = "Must be a positive distance (km)";
      }
    }
    if (step === 2) {
      if (!formValues.cargoWeight || isNaN(formValues.cargoWeight) || Number(formValues.cargoWeight) <= 0) {
        errors.cargoWeight = "Must be a positive cargo weight (kg)";
      }
    }
    if (step === 3) {
      if (!formValues.vehicleId) errors.vehicleId = "Please select an available vehicle";
      if (!formValues.driverId) errors.driverId = "Please assign a driver";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Submit dispatch action
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    if (isOverloaded) {
      toast.error("Cargo weight exceeds vehicle capacity constraint.");
      return;
    }

    try {
      const dispatched = await dispatchTrip(formValues);
      toast.success(`Trip T${String(dispatched.id).padStart(3, '0')} Dispatched successfully!`);
      
      // Reset form
      setFormValues({
        source: "",
        destination: "",
        plannedDistance: "",
        cargoWeight: "",
        vehicleId: "",
        driverId: ""
      });
      setFormErrors({});
      setActiveStep(1);
      setIsModalOpen(false);
    } catch {
      // Interceptors handle toast
    }
  };

  // Table Column Definitions
  const columns = [
    { key: "id", label: "Trip ID", width: "10%" },
    {
      key: "route",
      label: "Route Detail",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-primary">{row.source}</span>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <span className="font-semibold text-primary">{row.destination}</span>
        </div>
      )
    },
    { key: "cargoWeight", label: "Cargo Load (kg)", render: (row) => <span className="font-mono">{row.cargoWeight.toLocaleString()} kg</span> },
    { key: "plannedDistance", label: "Est. Distance", render: (row) => <span className="font-mono">{row.plannedDistance} km</span> },
    {
      key: "vehicleId",
      label: "Assigned Vehicle",
      render: (row) => {
        const v = vehicles.find(veh => veh.id === Number(row.vehicleId));
        return <span className="font-semibold font-mono">{v ? v.regNumber : row.vehicleId}</span>;
      }
    },
    {
      key: "driverId",
      label: "Operator",
      render: (row) => {
        const d = drivers.find(drv => drv.id === Number(row.driverId));
        return <span>{d ? d.name : row.driverId}</span>;
      }
    },
    { key: "status", label: "Dispatch Status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  // Selected Trip detail mappings
  const selectedTripObj = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  const detailVehicleObj = useMemo(() => {
    if (!selectedTripObj) return null;
    return vehicles.find(v => v.id === Number(selectedTripObj.vehicleId)) || null;
  }, [vehicles, selectedTripObj]);

  const detailDriverObj = useMemo(() => {
    if (!selectedTripObj) return null;
    return drivers.find(d => d.id === Number(selectedTripObj.driverId)) || null;
  }, [drivers, selectedTripObj]);

  // KPI calculations
  const totalTripsCount = trips.length;
  const activeDispatchedCount = trips.filter(t => t.status === "Dispatched").length;
  const completedTripsCount = trips.filter(t => t.status === "Completed").length;
  const cancelledTripsCount = trips.filter(t => t.status === "Cancelled").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Dispatches & Routes</h2>
          <p className="text-xs text-secondary">Dispatch logistics routes and manage trip execution stages.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Create Dispatch
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Dispatches" value={totalTripsCount} color="amber" />
        <KPICard label="Active On Road" value={activeDispatchedCount} color="blue" />
        <KPICard label="Trips Completed" value={completedTripsCount} color="green" />
        <KPICard label="Trips Cancelled" value={cancelledTripsCount} color="gray" />
      </div>

      {/* Main Table List */}
      <DataTable
        columns={columns}
        data={trips}
        onRowClick={(row) => setSelectedTripId(row.id)}
        emptyMessage="No logistics dispatches logged."
      />

      {/* Dispatch Creator Stepper Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveStep(1);
          setFormErrors({});
        }}
        title="New Logistics Dispatch Wizard"
      >
        <div className="space-y-6">
          {/* Stepper Progress bar */}
          <div className="flex items-center justify-between border-b border-default pb-4 select-none">
            {STEP_INFOS.map(({ step, title, desc }) => {
              const active = activeStep === step;
              const completed = activeStep > step;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                    active ? 'bg-accent text-[#0B0E14]' : 
                    completed ? 'bg-status-available/20 text-status-available border border-status-available/30' : 
                    'bg-input border border-default text-muted'
                  }`}>
                    {step}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-muted'}`}>{title}</p>
                    <p className="text-[9px] text-muted/65 mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {/* Step 1: Routing */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <Input
                  label="Starting Origin Depot"
                  name="source"
                  value={formValues.source}
                  onChange={handleInputChange}
                  error={formErrors.source}
                  placeholder="e.g. Central Depot Hub"
                />
                <Input
                  label="Destination Point"
                  name="destination"
                  value={formValues.destination}
                  onChange={handleInputChange}
                  error={formErrors.destination}
                  placeholder="e.g. Warehouse Sector B"
                />
                <Input
                  label="Planned Distance (km)"
                  name="plannedDistance"
                  value={formValues.plannedDistance}
                  onChange={handleInputChange}
                  error={formErrors.plannedDistance}
                  placeholder="e.g. 150"
                  type="number"
                />
                <div className="flex justify-end pt-4 border-t border-default">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancel</Button>
                  <Button onClick={handleNextStep}>Next Step</Button>
                </div>
              </div>
            )}

            {/* Step 2: Cargo Weight */}
            {activeStep === 2 && (
              <div className="space-y-3">
                <Input
                  label="Cargo Payload Weight (kg)"
                  name="cargoWeight"
                  value={formValues.cargoWeight}
                  onChange={handleInputChange}
                  error={formErrors.cargoWeight}
                  placeholder="e.g. 14500"
                  type="number"
                />
                <div className="flex justify-end pt-4 border-t border-default">
                  <Button variant="secondary" onClick={handlePrevStep} className="mr-3">Back</Button>
                  <Button onClick={handleNextStep}>Next Step</Button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle & Driver Selection */}
            {activeStep === 3 && (
              <div className="space-y-4">
                
                {/* Recommended Vehicles Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                      Select Vehicle (Smart Recommendation)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAllVehicles(!showAllVehicles)}
                      className="text-[10px] text-accent hover:underline font-semibold"
                    >
                      {showAllVehicles ? "Show Recommendations" : "Show All Available"}
                    </button>
                  </div>

                  {!showAllVehicles ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {recommendedVehicles.slice(0, 3).map((item) => {
                        const v = item.vehicle;
                        const matchPct = Math.round(item.score * 100);
                        const isSelected = String(v.id) === String(formValues.vehicleId);
                        return (
                          <div
                            key={v.id}
                            type="button"
                            onClick={() => setFormValues(prev => ({ ...prev, vehicleId: String(v.id) }))}
                            className={`p-3 rounded-lg border transition-all cursor-pointer text-left relative flex justify-between items-center ${
                              isSelected
                                ? 'bg-accent/5 border-accent shadow-md shadow-accent/10'
                                : 'bg-[#0B0E14]/40 border-default hover:border-accent/40'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-primary">{v.regNumber}</span>
                                <span className="text-[10px] text-secondary truncate">— {v.name}</span>
                              </div>
                              <p className="text-[9px] text-muted mt-1 leading-relaxed">
                                Cap: {v.maxLoadCapacity.toLocaleString()} kg · Odometer: {v.odometer.toLocaleString()} km
                              </p>
                              <p className="text-[8px] text-accent/80 font-medium mt-0.5 truncate italic">
                                {item.reason}
                              </p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full select-none shrink-0 ${
                              matchPct >= 80 ? 'bg-status-available/10 text-status-available border border-status-available/20' : 'bg-status-shop/10 text-status-shop border border-status-shop/20'
                            }`}>
                              {matchPct}% Match
                            </span>
                          </div>
                        );
                      })}
                      {recommendedVehicles.length === 0 && (
                        <div className="text-center py-4 bg-card border border-default rounded-lg text-xs text-muted select-none">
                          No suitable available vehicles found for this weight load.
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      name="vehicleId"
                      value={formValues.vehicleId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-input text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
                    >
                      <option value="">-- Select Available Vehicle --</option>
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.regNumber} — {v.name} (Cap: {v.maxLoadCapacity.toLocaleString()} kg)
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.vehicleId && <p className="text-[10px] text-status-retired font-medium">{formErrors.vehicleId}</p>}
                </div>

                {/* Recommended Drivers Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                      Assign Operator (Smart Recommendation)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAllDrivers(!showAllDrivers)}
                      className="text-[10px] text-accent hover:underline font-semibold"
                    >
                      {showAllDrivers ? "Show Recommendations" : "Show All Available"}
                    </button>
                  </div>

                  {!showAllDrivers ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {recommendedDrivers.slice(0, 3).map((item) => {
                        const d = item.driver;
                        const matchPct = Math.round(item.score * 100);
                        const isSelected = String(d.id) === String(formValues.driverId);
                        return (
                          <div
                            key={d.id}
                            type="button"
                            onClick={() => setFormValues(prev => ({ ...prev, driverId: String(d.id) }))}
                            className={`p-3 rounded-lg border transition-all cursor-pointer text-left relative flex justify-between items-center ${
                              isSelected
                                ? 'bg-accent/5 border-accent shadow-md shadow-accent/10'
                                : 'bg-[#0B0E14]/40 border-default hover:border-accent/40'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-primary">{d.name}</span>
                                <span className="text-[10px] text-secondary font-mono">({d.licenseCategory})</span>
                              </div>
                              <p className="text-[9px] text-muted mt-1 leading-relaxed">
                                Safety Score: {d.safetyScore}% · Completion: {d.tripCompletionPct}%
                              </p>
                              <p className="text-[8px] text-accent/80 font-medium mt-0.5 truncate italic">
                                {item.reason}
                              </p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full select-none shrink-0 ${
                              matchPct >= 80 ? 'bg-status-available/10 text-status-available border border-status-available/20' : 'bg-status-shop/10 text-status-shop border border-status-shop/20'
                            }`}>
                              {matchPct}% Match
                            </span>
                          </div>
                        );
                      })}
                      {recommendedDrivers.length === 0 && (
                        <div className="text-center py-4 bg-card border border-default rounded-lg text-xs text-muted select-none">
                          No available drivers found.
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      name="driverId"
                      value={formValues.driverId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
                    >
                      <option value="">-- Assign Available Operator --</option>
                      {availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — Class: {d.licenseCategory} (Safety: {d.safetyScore}%)
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.driverId && <p className="text-[10px] text-status-retired font-medium">{formErrors.driverId}</p>}
                </div>

                {/* Overload Capacity Check warning box */}
                <AnimatePresence>
                  {isOverloaded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-status-retired/10 border border-status-retired/20 text-status-retired text-[11px] font-medium rounded-lg flex gap-2 select-none items-start"
                    >
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Cargo Capacity Overload Warning:</span>
                        Weight ({Number(formValues.cargoWeight).toLocaleString()} kg) exceeds vehicle maximum capacity limit ({selectedVehicleObj?.maxLoadCapacity.toLocaleString()} kg).
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Buttons */}
                <div className="flex justify-end pt-4 border-t border-default select-none">
                  <Button variant="secondary" onClick={handlePrevStep} className="mr-3">Back</Button>
                  <Button type="submit" disabled={isOverloaded}>
                    Dispatch Route
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* Side Details Drawer */}
      <AnimatePresence>
        {selectedTripObj && (
          <div className="fixed inset-0 z-40 flex justify-end font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTripId(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-w-lg h-full bg-sidebar border-l border-default p-6 shadow-2xl flex flex-col overflow-hidden text-primary"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-default pb-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold">Dispatch Detail</h3>
                  <span className="font-mono text-xs text-secondary select-all">{selectedTripObj.id}</span>
                </div>
                <button
                  onClick={() => setSelectedTripId(null)}
                  className="text-muted hover:text-primary rounded-md p-1 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {/* Route Diagram card */}
                <div className="bg-card border border-default p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Route Path</span>
                    <StatusBadge status={selectedTripObj.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-accent" />
                      <div className="w-[2px] h-8 bg-default border-dashed border-default" />
                      <div className="w-2.5 h-2.5 rounded-full bg-status-shop border-2 border-status-shop" />
                    </div>
                    <div className="flex flex-col gap-3 font-semibold text-xs">
                      <div>
                        <span className="text-secondary font-medium mr-1.5">Origin:</span>
                        <span>{selectedTripObj.source}</span>
                      </div>
                      <div>
                        <span className="text-secondary font-medium mr-1.5">Destination:</span>
                        <span>{selectedTripObj.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 1: Trip Timeline */}
                <div className="bg-card border border-default p-4 rounded-xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-1.5">
                    <GitBranch size={13} className="text-accent" />
                    Dispatch Lifecycle
                  </h4>
                  <TripTimeline trip={selectedTripObj} />
                </div>

                {/* Details list */}
                <div className="space-y-4">
                  {/* Distance & Load */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-3 rounded-lg border border-default">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">Cargo weight</span>
                      <span className="font-mono font-bold mt-1 block text-sm">{selectedTripObj.cargoWeight.toLocaleString()} kg</span>
                    </div>
                    <div className="bg-card p-3 rounded-lg border border-default">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">Planned Distance</span>
                      <span className="font-mono font-bold mt-1 block text-sm">{selectedTripObj.plannedDistance} km</span>
                    </div>
                  </div>

                  {/* Assigned Vehicle details */}
                  <div className="bg-card p-4 rounded-xl border border-default space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">Vehicle details</span>
                    {detailVehicleObj ? (
                      <div className="flex items-center gap-3 text-xs">
                        <Truck size={20} className="text-accent shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">{detailVehicleObj.name}</div>
                          <div className="font-mono text-[10px] text-secondary mt-0.5">{detailVehicleObj.regNumber}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">No vehicle mapping found.</span>
                    )}
                  </div>

                  {/* Assigned Operator details */}
                  <div className="bg-card p-4 rounded-xl border border-default space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">Driver details</span>
                    {detailDriverObj ? (
                      <div className="flex items-center gap-3 text-xs">
                        <User size={20} className="text-accent shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">{detailDriverObj.name}</div>
                          <div className="text-[10px] text-secondary mt-0.5">License: {detailDriverObj.licenseNumber} (Cat {detailDriverObj.licenseCategory})</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">No driver mapping found.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom life-cycle control buttons */}
              {selectedTripObj.status === 'Dispatched' && (
                <div className="mt-auto border-t border-default pt-4 flex gap-3 select-none">
                  {/* Cancel dispatch */}
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await cancelTrip(selectedTripObj.rawId);
                        toast.success(`Trip T${String(selectedTripObj.rawId).padStart(3, '0')} Cancelled.`);
                        setSelectedTripId(null);
                      } catch {
                        // handled
                      }
                    }}
                    className="flex-1 !py-2.5 border-status-retired/30 text-status-retired hover:bg-status-retired/5 hover:border-status-retired"
                  >
                    Cancel Dispatch
                  </Button>

                  {/* Complete dispatch */}
                  <Button
                    onClick={async () => {
                      try {
                        await completeTrip(selectedTripObj.rawId);
                        toast.success(`Trip T${String(selectedTripObj.rawId).padStart(3, '0')} Completed!`);
                        setSelectedTripId(null);
                      } catch {
                        // handled
                      }
                    }}
                    className="flex-1 !py-2.5"
                  >
                    Complete Dispatch
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trips;
export { Trips };
