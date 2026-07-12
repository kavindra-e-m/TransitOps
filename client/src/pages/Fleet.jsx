import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, X, Truck, Wrench, Calendar, Compass, DollarSign, Activity } from 'lucide-react';

import { useVehicles, useTrips, useMaintenance, useAppActions } from '../context/AppContext';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Fleet = () => {
  const vehicles = useVehicles();
  const trips = useTrips();
  const maintenance = useMaintenance();
  const { addVehicle } = useAppActions();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Drawer / Selection State
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formValues, setFormValues] = useState({
    regNumber: "",
    name: "",
    type: "Heavy Truck",
    maxLoadCapacity: "",
    odometer: "",
    acquisitionCost: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Form Field Validation (Real-time uniqueness check)
  const validateField = (name, value) => {
    let error = "";
    if (name === "regNumber") {
      if (!value.trim()) {
        error = "Registration number is required";
      } else if (
        vehicles.some(
          (v) => v.regNumber.trim().toUpperCase() === value.trim().toUpperCase()
        )
      ) {
        error = "This registration number is already registered";
      }
    }
    if (name === "name" && !value.trim()) {
      error = "Vehicle name/model is required";
    }
    if (name === "maxLoadCapacity") {
      if (!value) error = "Capacity is required";
      else if (isNaN(value) || Number(value) <= 0) error = "Must be a positive number";
    }
    if (name === "odometer") {
      if (value === "") error = "Odometer reading is required";
      else if (isNaN(value) || Number(value) < 0) error = "Must be a non-negative number";
    }
    if (name === "acquisitionCost") {
      if (!value) error = "Acquisition cost is required";
      else if (isNaN(value) || Number(value) <= 0) error = "Must be a positive number";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation checks
    const errors = {};
    if (!formValues.regNumber.trim()) errors.regNumber = "Registration number is required";
    else if (vehicles.some(v => v.regNumber.trim().toUpperCase() === formValues.regNumber.trim().toUpperCase())) {
      errors.regNumber = "This registration number is already registered";
    }
    if (!formValues.name.trim()) errors.name = "Vehicle name/model is required";
    if (!formValues.maxLoadCapacity || isNaN(formValues.maxLoadCapacity) || Number(formValues.maxLoadCapacity) <= 0) {
      errors.maxLoadCapacity = "Must be a positive number";
    }
    if (formValues.odometer === "" || isNaN(formValues.odometer) || Number(formValues.odometer) < 0) {
      errors.odometer = "Must be a non-negative number";
    }
    if (!formValues.acquisitionCost || isNaN(formValues.acquisitionCost) || Number(formValues.acquisitionCost) <= 0) {
      errors.acquisitionCost = "Must be a positive number";
    }

    if (Object.keys(errors).some(k => errors[k])) {
      setFormErrors(errors);
      toast.error("Please resolve the validation errors before submitting.");
      return;
    }

    // Call Context action to add vehicle
    addVehicle(formValues);
    toast.success(`Vehicle ${formValues.regNumber} registered successfully!`);
    
    // Reset and Close
    setFormValues({
      regNumber: "",
      name: "",
      type: "Heavy Truck",
      maxLoadCapacity: "",
      odometer: "",
      acquisitionCost: ""
    });
    setFormErrors({});
    setIsModalOpen(false);
  };

  // Filtered Vehicles list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.regNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          v.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = selectedType === "All" || v.type === selectedType;
    const matchesStatus = selectedStatus === "All" || v.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Table Column Definitions
  const columns = [
    { key: "id", label: "ID", width: "10%" },
    { key: "regNumber", label: "Reg Number", render: (row) => <span className="font-mono font-semibold">{row.regNumber}</span> },
    { key: "name", label: "Vehicle Model" },
    { key: "type", label: "Type" },
    { key: "maxLoadCapacity", label: "Max Load (kg)", render: (row) => <span className="font-mono">{row.maxLoadCapacity.toLocaleString()} kg</span> },
    { key: "odometer", label: "Odometer", render: (row) => <span className="font-mono">{row.odometer.toLocaleString()} km</span> },
    { key: "acquisitionCost", label: "Acquisition Cost", render: (row) => <span className="font-mono">${row.acquisitionCost.toLocaleString()}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  // Selected Vehicle Detailed Stats
  const vehicleTrips = selectedVehicle ? trips.filter(t => t.vehicleId === selectedVehicle.id) : [];
  const vehicleMaintenance = selectedVehicle ? maintenance.filter(m => m.vehicleId === selectedVehicle.id) : [];

  // KPI Computations
  const totalVehiclesCount = vehicles.length;
  const availableVehiclesCount = vehicles.filter(v => v.status === "Available").length;
  const onTripVehiclesCount = vehicles.filter(v => v.status === "On Trip").length;
  const shopVehiclesCount = vehicles.filter(v => v.status === "In Shop").length;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Fleet Overview</h2>
          <p className="text-xs text-text-secondary">Register, monitor, and audit your fleet inventory.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Vehicle
        </Button>
      </div>

      {/* KPI Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Vehicles" value={totalVehiclesCount} color="amber" />
        <KPICard label="Available Vehicles" value={availableVehiclesCount} color="green" />
        <KPICard label="On Trip (Active)" value={onTripVehiclesCount} color="blue" />
        <KPICard label="In Maintenance" value={shopVehiclesCount} color="orange" />
      </div>

      {/* Amber Dispatch Warning Banner */}
      <div className="bg-accent/10 border-l-[3.5px] border-accent p-3.5 rounded-lg flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent select-none">
          !
        </div>
        <p className="text-[12px] font-semibold text-accent uppercase tracking-wider">
          System Rule: Retired or In Shop vehicles cannot be dispatched.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5 rounded-xl border border-default bg-card">
        {/* Search */}
        <div className="relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Search Fleet</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search Reg No, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-input border border-default text-sm text-text-primary rounded-lg focus:outline-none focus:border-border-focus transition-all"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Vehicle Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-1.5 bg-input border border-default text-sm text-text-primary rounded-lg focus:outline-none focus:border-border-focus"
          >
            <option value="All">All Types</option>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Medium Truck">Medium Truck</option>
            <option value="Light Van">Light Van</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-input border border-default text-sm text-text-primary rounded-lg focus:outline-none focus:border-border-focus"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Clear Filters Helper */}
        <div className="flex items-end">
          {(searchQuery || selectedType !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
                setSelectedStatus("All");
              }}
              className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center gap-1.5 pb-2.5"
            >
              <X size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Registry Data Table */}
      <DataTable
        columns={columns}
        data={filteredVehicles}
        onRowClick={(row) => setSelectedVehicle(row)}
        emptyMessage="No vehicles match the selected filter criteria."
      />

      {/* Register Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Add Vehicle to Registry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registration Number (Unique)"
            name="regNumber"
            value={formValues.regNumber}
            onChange={handleInputChange}
            error={formErrors.regNumber}
            placeholder="e.g. TX-9088-A"
          />

          <Input
            label="Name / Model"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            error={formErrors.name}
            placeholder="e.g. Volvo FH16 Globetrotter"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Vehicle Type
            </label>
            <select
              name="type"
              value={formValues.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input text-text-primary rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
            >
              <option value="Heavy Truck">Heavy Truck</option>
              <option value="Medium Truck">Medium Truck</option>
              <option value="Light Van">Light Van</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Capacity (kg)"
              name="maxLoadCapacity"
              value={formValues.maxLoadCapacity}
              onChange={handleInputChange}
              error={formErrors.maxLoadCapacity}
              placeholder="e.g. 20000"
              type="number"
            />
            <Input
              label="Odometer (km)"
              name="odometer"
              value={formValues.odometer}
              onChange={handleInputChange}
              error={formErrors.odometer}
              placeholder="e.g. 1000"
              type="number"
            />
          </div>

          <Input
            label="Acquisition Cost ($)"
            name="acquisitionCost"
            value={formValues.acquisitionCost}
            onChange={handleInputChange}
            error={formErrors.acquisitionCost}
            placeholder="e.g. 85000"
            type="number"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-default">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Side History Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-w-xl h-full bg-sidebar border-l border-default p-6 shadow-2xl flex flex-col overflow-hidden text-text-primary"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-default pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{selectedVehicle.name}</h3>
                    <StatusBadge status={selectedVehicle.status} />
                  </div>
                  <span className="font-mono text-sm text-text-secondary select-all">{selectedVehicle.regNumber}</span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-text-muted hover:text-text-primary rounded-md p-1 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 bg-card border border-default p-4 rounded-xl">
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Odometer</p>
                    <p className="font-mono text-sm font-semibold mt-1">{selectedVehicle.odometer.toLocaleString()} km</p>
                  </div>
                  <div className="text-center border-x border-default">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Max Capacity</p>
                    <p className="font-mono text-sm font-semibold mt-1">{selectedVehicle.maxLoadCapacity.toLocaleString()} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Acq. Cost</p>
                    <p className="font-mono text-sm font-semibold mt-1">${selectedVehicle.acquisitionCost.toLocaleString()}</p>
                  </div>
                </div>

                {/* Trip History Sub-section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                    <Compass size={14} className="text-accent" />
                    Trip History ({vehicleTrips.length})
                  </h4>
                  {vehicleTrips.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleTrips.map(trip => (
                        <div key={trip.id} className="bg-card p-3 rounded-lg border border-default text-xs flex justify-between items-center">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <span>{trip.source.split(',')[0]}</span>
                              <span className="text-text-muted">→</span>
                              <span>{trip.destination.split(',')[0]}</span>
                            </div>
                            <span className="text-text-muted text-[10px] block mt-1">Cargo: {trip.cargoWeight} kg | Distance: {trip.plannedDistance} km</span>
                          </div>
                          <StatusBadge status={trip.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-default rounded-lg text-text-muted text-xs">
                      No trip logs found for this vehicle.
                    </div>
                  )}
                </div>

                {/* Maintenance Log Sub-section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                    <Wrench size={14} className="text-accent" />
                    Maintenance History ({vehicleMaintenance.length})
                  </h4>
                  {vehicleMaintenance.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleMaintenance.map(record => (
                        <div key={record.id} className="bg-card p-3 rounded-lg border border-default text-xs flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-text-primary">{record.serviceType}</div>
                            <span className="text-text-muted text-[10px] mt-1 flex items-center gap-2">
                              <Calendar size={10} /> {record.date} | <DollarSign size={10} /> {record.cost.toLocaleString()}
                            </span>
                          </div>
                          <StatusBadge status={record.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-default rounded-lg text-text-muted text-xs">
                      No maintenance records found for this vehicle.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fleet;
export { Fleet };
