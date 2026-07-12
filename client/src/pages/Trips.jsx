import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Compass, User, Truck, Check, X, Play, ShieldAlert, ArrowRight, Calendar } from 'lucide-react';

import { useVehicles, useDrivers, useTrips, useAppActions } from '../context/AppContext';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const CURRENT_DATE = new Date("2026-07-12");

const Trips = () => {
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const trips = useTrips();
  const { dispatchTrip, completeTrip, cancelTrip } = useAppActions();

  // Selection state for stepper tracking
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || null);

  // Selected Trip detail
  const selectedTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || trips[0] || null;
  }, [trips, selectedTripId]);

  // Form states
  const [formValues, setFormValues] = useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
    plannedDistance: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Dropdown filtering
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.status === 'Available' && 
      new Date(d.licenseExpiryDate) >= CURRENT_DATE
    );
  }, [drivers]);

  // Selected Vehicle for Live Validation
  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.id === formValues.vehicleId) || null;
  }, [vehicles, formValues.vehicleId]);

  // Live Capacity Overload check
  const isOverCapacity = useMemo(() => {
    if (!selectedVehicleObj || !formValues.cargoWeight) return false;
    return Number(formValues.cargoWeight) > selectedVehicleObj.maxLoadCapacity;
  }, [selectedVehicleObj, formValues.cargoWeight]);

  // Inputs Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check errors
    const errors = {};
    if (!formValues.source.trim()) errors.source = "Source location is required";
    if (!formValues.destination.trim()) errors.destination = "Destination is required";
    if (!formValues.vehicleId) errors.vehicleId = "Select a vehicle";
    if (!formValues.driverId) errors.driverId = "Select a driver";
    if (!formValues.cargoWeight || isNaN(formValues.cargoWeight) || Number(formValues.cargoWeight) <= 0) {
      errors.cargoWeight = "Enter a valid positive cargo weight";
    }
    if (!formValues.plannedDistance || isNaN(formValues.plannedDistance) || Number(formValues.plannedDistance) <= 0) {
      errors.plannedDistance = "Enter a valid distance";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please complete the dispatch form.");
      return;
    }

    if (isOverCapacity) {
      toast.error("Cannot dispatch: vehicle cargo limit exceeded.");
      return;
    }

    // Call context dispatch action
    const newTrip = dispatchTrip(formValues);
    toast.success(`Trip T${newTrip.id.replace('T', '')} dispatched successfully!`);
    
    // Select new trip in stepper
    setSelectedTripId(newTrip.id);

    // Reset Form
    setFormValues({
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargoWeight: "",
      plannedDistance: ""
    });
  };

  // Status Stepper configuration helper
  const getStepperData = (status = 'Draft') => {
    const s = status.toLowerCase();
    
    if (s === 'cancelled') {
      return {
        steps: ['Draft', 'Dispatched', 'Cancelled'],
        activeStep: 2, // zero indexed
        color: 'text-status-retired bg-status-retired',
        lineColor: 'bg-status-retired'
      };
    }

    const steps = ['Draft', 'Dispatched', 'Completed'];
    let activeStep = 0;
    let color = 'text-accent bg-accent';
    let lineColor = 'bg-accent';

    if (s === 'dispatched') {
      activeStep = 1;
      color = 'text-[#3B82F6] bg-[#3B82F6]';
      lineColor = 'bg-[#3B82F6]';
    } else if (s === 'completed') {
      activeStep = 2;
      color = 'text-[#22C55E] bg-[#22C55E]';
      lineColor = 'bg-[#22C55E]';
    }

    return { steps, activeStep, color, lineColor };
  };

  const stepper = useMemo(() => {
    return getStepperData(selectedTrip?.status);
  }, [selectedTrip]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Trip Dispatcher</h2>
        <p className="text-xs text-text-secondary">Plan new dispatches, validate weights, and manage active logistics boards.</p>
      </div>

      {/* Stepper (Horizontal Stepper at Top) */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-default bg-card flex flex-col items-center justify-center select-none"
          >
            <div className="text-center mb-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Currently Tracking Status of:</span>
              <span className="font-mono text-sm font-semibold text-accent">{selectedTrip.id}</span>
              <span className="text-xs text-text-muted"> ({selectedTrip.source.split(',')[0]} → {selectedTrip.destination.split(',')[0]})</span>
            </div>

            {/* Stepper Graphic */}
            <div className="relative flex items-center justify-between w-full max-w-lg mt-2 mb-4">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 h-0.5 bg-border-default top-1/2 -translate-y-1/2 z-0" />
              
              {/* Progress filling line */}
              <motion.div
                className={`absolute left-0 h-0.5 ${stepper.lineColor} top-1/2 -translate-y-1/2 z-0`}
                initial={{ width: 0 }}
                animate={{ 
                  width: stepper.activeStep === 0 ? '0%' : stepper.activeStep === 1 ? '50%' : '100%' 
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Steps Dots */}
              {stepper.steps.map((label, idx) => {
                const isCompleted = idx < stepper.activeStep;
                const isActive = idx === stepper.activeStep;
                const isPending = idx > stepper.activeStep;

                let dotColor = "border-default bg-[#131826] text-text-muted";
                if (isActive) dotColor = `border-accent text-accent shadow-md shadow-accent/20 ring-4 ring-accent/10`;
                if (isCompleted) {
                  dotColor = stepper.color.includes('status-retired') 
                    ? "border-status-retired bg-status-retired text-white" 
                    : stepper.activeStep === 2 
                      ? "border-status-available bg-status-available text-[#0B0E14]" 
                      : "border-status-ontrip bg-status-ontrip text-white";
                }

                return (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    <motion.div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${dotColor} transition-colors duration-300`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                    >
                      {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </motion.div>
                    <span 
                      className={`text-[10px] font-semibold mt-1.5 transition-colors duration-200
                        ${isActive ? 'text-text-primary' : 'text-text-muted'}
                      `}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Form Left, Board Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 p-6 rounded-xl border border-default bg-card space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-2.5 mb-2 flex items-center gap-2 select-none">
            <Play size={16} className="text-accent" />
            Dispatch New Trip
          </h3>

          <Input
            label="Source Location"
            name="source"
            value={formValues.source}
            onChange={handleInputChange}
            error={formErrors.source}
            placeholder="e.g. Houston Logistics, TX"
          />

          <Input
            label="Destination"
            name="destination"
            value={formValues.destination}
            onChange={handleInputChange}
            error={formErrors.destination}
            placeholder="e.g. Dallas Hub, TX"
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Selection */}
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
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} — {v.name} ({v.maxLoadCapacity.toLocaleString()} kg)
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && (
                <p className="text-[10px] text-status-retired mt-0.5">{formErrors.vehicleId}</p>
              )}
            </div>

            {/* Driver Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
                Assign Driver
              </label>
              <select
                name="driverId"
                value={formValues.driverId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border focus:outline-none focus:border-border-focus transition-all duration-200 
                  ${formErrors.driverId ? 'border-status-retired' : 'border-default'}
                `}
              >
                <option value="">Select Driver...</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Safety: {d.safetyScore}%)
                  </option>
                ))}
              </select>
              {formErrors.driverId && (
                <p className="text-[10px] text-status-retired mt-0.5">{formErrors.driverId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cargo Weight (kg)"
              name="cargoWeight"
              value={formValues.cargoWeight}
              onChange={handleInputChange}
              error={formErrors.cargoWeight}
              placeholder="e.g. 5000"
              type="number"
            />
            <Input
              label="Planned Distance (km)"
              name="plannedDistance"
              value={formValues.plannedDistance}
              onChange={handleInputChange}
              error={formErrors.plannedDistance}
              placeholder="e.g. 250"
              type="number"
            />
          </div>

          {/* Live Weight Validation Alert Banner */}
          <AnimatePresence>
            {isOverCapacity && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-status-retired/10 border border-status-retired/30 p-3 rounded-lg flex gap-2.5 items-start text-xs text-status-retired"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold">Over Capacity Warning: </span>
                  Cargo weight of {Number(formValues.cargoWeight).toLocaleString()} kg exceeds vehicle's max capacity of {selectedVehicleObj?.maxLoadCapacity.toLocaleString()} kg!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            type="submit" 
            disabled={isOverCapacity} 
            className="w-full mt-2"
          >
            Dispatch Trip
          </Button>
        </form>

        {/* Right Column: Live Board */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-default pb-2.5 flex items-center justify-between select-none">
            <span>Logistics Dispatch Board ({trips.length})</span>
            <span className="text-[10px] text-text-muted uppercase tracking-normal">Click trip card to track status</span>
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
            <AnimatePresence initial={false}>
              {trips.map((trip) => {
                const isSelected = selectedTripId === trip.id;
                
                // Fetch vehicle and driver info for display
                const tripVeh = vehicles.find(v => v.id === trip.vehicleId);
                const tripDrv = drivers.find(d => d.id === trip.driverId);

                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none
                      ${isSelected 
                        ? 'border-accent bg-card-hover shadow-lg shadow-accent/5 ring-1 ring-accent/20' 
                        : 'border-default bg-card hover:bg-card-hover hover:border-text-secondary/30'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <span className="font-mono text-xs font-bold text-accent">{trip.id}</span>
                        <div className="text-sm font-bold text-text-primary mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{trip.source.split(',')[0]}</span>
                          <ArrowRight size={12} className="text-text-muted" />
                          <span>{trip.destination.split(',')[0]}</span>
                        </div>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-default/50 py-2.5 my-2.5 text-xs text-text-secondary font-medium">
                      <div className="flex items-center gap-1.5">
                        <Truck size={14} className="text-text-muted" />
                        <span>{tripVeh ? `${tripVeh.regNumber} (${tripVeh.name.split(' ')[0]})` : 'Unknown Vehicle'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-text-muted" />
                        <span>{tripDrv ? tripDrv.name : 'Unknown Driver'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted font-semibold">
                      <span>Cargo: <span className="font-mono text-text-secondary">{trip.cargoWeight.toLocaleString()} kg</span></span>
                      <span>Distance: <span className="font-mono text-text-secondary">{trip.plannedDistance.toLocaleString()} km</span></span>
                    </div>

                    {/* Operational controls for Dispatched trips */}
                    {trip.status === "Dispatched" && (
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-default/40" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            cancelTrip(trip.id);
                            toast.success(`Trip ${trip.id} Cancelled.`);
                          }}
                          className="!px-2.5 !py-1 !text-[11px] border-status-retired/30 text-status-retired hover:bg-status-retired/5 hover:border-status-retired"
                        >
                          <X size={12} />
                          Cancel Trip
                        </Button>
                        <Button
                          onClick={() => {
                            completeTrip(trip.id);
                            toast.success(`Trip ${trip.id} Completed!`);
                          }}
                          className="!px-2.5 !py-1 !text-[11px] bg-status-available hover:bg-[#1bb050] text-[#0B0E14]"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          Complete
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
export { Trips };
