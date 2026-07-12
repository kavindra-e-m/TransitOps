import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Receipt, Fuel, Landmark, ArrowUpRight, DollarSign, Plus, Eye, X, Filter } from 'lucide-react';

import { useVehicles, useExpenses, useAppActions } from '../context/AppContext';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const FuelExpenses = () => {
  const vehicles = useVehicles();
  const expenses = useExpenses();
  const { addExpense } = useAppActions();

  // Selected vehicle filter for calculation & listing
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("All");

  // Modals States
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms States
  const [fuelValues, setFuelValues] = useState({
    vehicleId: "",
    liters: "",
    cost: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [fuelErrors, setFuelErrors] = useState({});

  const [expenseValues, setExpenseValues] = useState({
    vehicleId: "",
    type: "toll", // toll, repair, other
    cost: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [expenseErrors, setExpenseErrors] = useState({});

  // Cost Banner Pulse State
  const [pulseBanner, setPulseBanner] = useState(false);

  // Compute Total Cost
  const totalCost = useMemo(() => {
    return expenses
      .filter(exp => {
        const matchesVehicle = selectedVehicleFilter === "All" || exp.vehicleId === selectedVehicleFilter;
        const isOperational = exp.type === 'fuel' || exp.type === 'repair' || exp.type === 'maintenance';
        return matchesVehicle && isOperational;
      })
      .reduce((sum, exp) => sum + exp.cost, 0);
  }, [expenses, selectedVehicleFilter]);

  // Flash Banner when total cost changes
  useEffect(() => {
    if (totalCost > 0) {
      setPulseBanner(true);
      const timer = setTimeout(() => {
        setPulseBanner(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [totalCost]);

  // Handle Fuel Submit
  const handleFuelSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!fuelValues.vehicleId) errors.vehicleId = "Select a vehicle";
    if (!fuelValues.liters || isNaN(fuelValues.liters) || Number(fuelValues.liters) <= 0) {
      errors.liters = "Must be a positive number";
    }
    if (!fuelValues.cost || isNaN(fuelValues.cost) || Number(fuelValues.cost) <= 0) {
      errors.cost = "Must be a positive number";
    }
    if (!fuelValues.date) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setFuelErrors(errors);
      toast.error("Please resolve the validation errors.");
      return;
    }

    addExpense({
      vehicleId: fuelValues.vehicleId,
      type: "fuel",
      liters: Number(fuelValues.liters),
      cost: Number(fuelValues.cost),
      date: fuelValues.date
    });

    toast.success(`Fuel log registered.`);
    setIsFuelModalOpen(false);
    
    // Reset Form
    setFuelValues({
      vehicleId: "",
      liters: "",
      cost: "",
      date: new Date().toISOString().split('T')[0]
    });
    setFuelErrors({});
  };

  // Handle Expense Submit
  const handleExpenseSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!expenseValues.vehicleId) errors.vehicleId = "Select a vehicle";
    if (!expenseValues.cost || isNaN(expenseValues.cost) || Number(expenseValues.cost) <= 0) {
      errors.cost = "Must be a positive number";
    }
    if (!expenseValues.date) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setExpenseErrors(errors);
      toast.error("Please resolve the validation errors.");
      return;
    }

    addExpense({
      vehicleId: expenseValues.vehicleId,
      type: expenseValues.type,
      cost: Number(expenseValues.cost),
      date: expenseValues.date
    });

    toast.success(`Expense registered.`);
    setIsExpenseModalOpen(false);

    // Reset Form
    setExpenseValues({
      vehicleId: "",
      type: "toll",
      cost: "",
      date: new Date().toISOString().split('T')[0]
    });
    setExpenseErrors({});
  };

  // Split fuel and other expenses lists, applying vehicle filters
  const fuelLogs = useMemo(() => {
    return expenses.filter(exp => 
      exp.type === 'fuel' && 
      (selectedVehicleFilter === "All" || exp.vehicleId === selectedVehicleFilter)
    );
  }, [expenses, selectedVehicleFilter]);

  const otherExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.type !== 'fuel' && 
      (selectedVehicleFilter === "All" || exp.vehicleId === selectedVehicleFilter)
    );
  }, [expenses, selectedVehicleFilter]);

  // KPI Calculations
  const fleetFuelSpend = useMemo(() => {
    return expenses.filter(e => e.type === 'fuel').reduce((sum, e) => sum + e.cost, 0);
  }, [expenses]);

  const fleetTollSpend = useMemo(() => {
    return expenses.filter(e => e.type === 'toll').reduce((sum, e) => sum + e.cost, 0);
  }, [expenses]);

  const fleetRepairSpend = useMemo(() => {
    return expenses.filter(e => e.type === 'repair' || e.type === 'maintenance').reduce((sum, e) => sum + e.cost, 0);
  }, [expenses]);

  // Tables Columns Definitions
  const fuelColumns = [
    { key: "id", label: "Receipt ID" },
    { 
      key: "vehicleId", 
      label: "Vehicle", 
      render: (row) => {
        const v = vehicles.find(veh => veh.id === row.vehicleId);
        return <span className="font-semibold">{v ? v.regNumber : row.vehicleId}</span>;
      }
    },
    { key: "liters", label: "Liters", render: (row) => <span className="font-mono">{row.liters} L</span> },
    { key: "cost", label: "Cost ($)", render: (row) => <span className="font-mono">${row.cost.toLocaleString()}</span> },
    { key: "date", label: "Date", render: (row) => <span className="font-mono text-xs">{row.date}</span> }
  ];

  const expenseColumns = [
    { key: "id", label: "Receipt ID" },
    { 
      key: "vehicleId", 
      label: "Vehicle", 
      render: (row) => {
        const v = vehicles.find(veh => veh.id === row.vehicleId);
        return <span className="font-semibold">{v ? v.regNumber : row.vehicleId}</span>;
      }
    },
    { 
      key: "type", 
      label: "Type", 
      render: (row) => {
        const isRepair = row.type === 'repair';
        return (
          <span className={`inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold ${isRepair ? 'text-status-shop' : 'text-[#A78BFA]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {row.type}
          </span>
        );
      } 
    },
    { key: "cost", label: "Cost ($)", render: (row) => <span className="font-mono">${row.cost.toLocaleString()}</span> },
    { key: "date", label: "Date", render: (row) => <span className="font-mono text-xs">{row.date}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Expenses & Fuel</h2>
          <p className="text-xs text-text-secondary">Log fuel refills, track toll charges, and compute operational spendings.</p>
        </div>
        
        {/* Dropdown vehicle filter */}
        <div className="flex items-center gap-2 bg-card border border-default px-3 py-1.5 rounded-lg select-none">
          <Filter size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-secondary">Filter Vehicle:</span>
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-card text-text-primary">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id} className="bg-card text-text-primary">
                {v.regNumber} — {v.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard label="Fleet Fuel Spend" value={fleetFuelSpend} prefix="$" color="blue" />
        <KPICard label="Toll & Auxiliary Spend" value={fleetTollSpend} prefix="$" color="gray" />
        <KPICard label="Repairs & Shop Spend" value={fleetRepairSpend} prefix="$" color="orange" />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Fuel Logs Table */}
        <div className="p-6 rounded-xl border border-default bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 select-none">
              <Fuel size={16} className="text-accent" />
              Fuel Refill Logs ({fuelLogs.length})
            </h3>
            <Button onClick={() => setIsFuelModalOpen(true)} className="!px-3 !py-1 !text-xs">
              <Plus size={12} />
              Log Fuel
            </Button>
          </div>
          <DataTable
            columns={fuelColumns}
            data={fuelLogs}
            emptyMessage="No fuel transactions recorded for this vehicle."
          />
        </div>

        {/* Other Expenses Table */}
        <div className="p-6 rounded-xl border border-default bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 select-none">
              <Landmark size={16} className="text-accent" />
              Toll & Maintenance Expenses ({otherExpenses.length})
            </h3>
            <Button onClick={() => setIsExpenseModalOpen(true)} className="!px-3 !py-1 !text-xs">
              <Plus size={12} />
              Add Expense
            </Button>
          </div>
          <DataTable
            columns={expenseColumns}
            data={otherExpenses}
            emptyMessage="No toll or repair transactions recorded for this vehicle."
          />
        </div>

      </div>

      {/* Total Operational Cost Banner at Bottom */}
      <motion.div
        animate={pulseBanner ? { 
          backgroundColor: ["#131826", "#F59E0B", "#131826"],
          borderColor: ["#1F2937", "#F59E0B", "#1F2937"]
        } : {}}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-xl border border-default bg-card flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-xl"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 justify-center sm:justify-start">
            <ArrowUpRight size={14} className="text-accent" />
            Total Operational Cost
          </h4>
          <p className="text-[11px] text-text-muted font-medium">
            Calculated as SUM(Fuel Cost) + SUM(Repairs & Workshop Cost) for: 
            <span className="text-text-secondary font-semibold ml-1">
              {selectedVehicleFilter === "All" ? "Entire Fleet" : vehicles.find(v => v.id === selectedVehicleFilter)?.regNumber}
            </span>
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-sans text-text-muted">$</span>
          <span className="font-mono text-3xl font-extrabold text-text-primary tracking-tight">
            {totalCost.toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* Log Fuel Modal */}
      <Modal
        isOpen={isFuelModalOpen}
        onClose={() => {
          setIsFuelModalOpen(false);
          setFuelErrors({});
        }}
        title="Log Fuel Refill"
      >
        <form onSubmit={handleFuelSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Assign Vehicle
            </label>
            <select
              value={fuelValues.vehicleId}
              onChange={(e) => {
                setFuelValues(prev => ({ ...prev, vehicleId: e.target.value }));
                if (fuelErrors.vehicleId) setFuelErrors(prev => ({ ...prev, vehicleId: "" }));
              }}
              className={`w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border focus:outline-none focus:border-border-focus transition-all duration-200 
                ${fuelErrors.vehicleId ? 'border-status-retired' : 'border-default'}
              `}
            >
              <option value="">Select Vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} — {v.name}
                </option>
              ))}
            </select>
            {fuelErrors.vehicleId && (
              <p className="text-[10px] text-status-retired mt-0.5">{fuelErrors.vehicleId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fuel Liters"
              value={fuelValues.liters}
              onChange={(e) => {
                setFuelValues(prev => ({ ...prev, liters: e.target.value }));
                if (fuelErrors.liters) setFuelErrors(prev => ({ ...prev, liters: "" }));
              }}
              error={fuelErrors.liters}
              placeholder="e.g. 50"
              type="number"
            />
            <Input
              label="Cost ($)"
              value={fuelValues.cost}
              onChange={(e) => {
                setFuelValues(prev => ({ ...prev, cost: e.target.value }));
                if (fuelErrors.cost) setFuelErrors(prev => ({ ...prev, cost: "" }));
              }}
              error={fuelErrors.cost}
              placeholder="e.g. 80"
              type="number"
            />
          </div>

          <Input
            label="Log Date"
            value={fuelValues.date}
            onChange={(e) => {
              setFuelValues(prev => ({ ...prev, date: e.target.value }));
              if (fuelErrors.date) setFuelErrors(prev => ({ ...prev, date: "" }));
            }}
            error={fuelErrors.date}
            type="date"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-default">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFuelModalOpen(false);
                setFuelErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Log Fuel Refill
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseErrors({});
        }}
        title="Add Other Operational Expense"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
              Assign Vehicle
            </label>
            <select
              value={expenseValues.vehicleId}
              onChange={(e) => {
                setExpenseValues(prev => ({ ...prev, vehicleId: e.target.value }));
                if (expenseErrors.vehicleId) setExpenseErrors(prev => ({ ...prev, vehicleId: "" }));
              }}
              className={`w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border focus:outline-none focus:border-border-focus transition-all duration-200 
                ${expenseErrors.vehicleId ? 'border-status-retired' : 'border-default'}
              `}
            >
              <option value="">Select Vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} — {v.name}
                </option>
              ))}
            </select>
            {expenseErrors.vehicleId && (
              <p className="text-[10px] text-status-retired mt-0.5">{expenseErrors.vehicleId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
                Expense Type
              </label>
              <select
                value={expenseValues.type}
                onChange={(e) => setExpenseValues(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-input text-text-primary text-sm rounded-lg border border-default focus:outline-none focus:border-border-focus transition-all duration-200"
              >
                <option value="toll">Toll Fee</option>
                <option value="repair">Workshop Repair</option>
                <option value="other">Other Charge</option>
              </select>
            </div>

            <Input
              label="Cost ($)"
              value={expenseValues.cost}
              onChange={(e) => {
                setExpenseValues(prev => ({ ...prev, cost: e.target.value }));
                if (expenseErrors.cost) setExpenseErrors(prev => ({ ...prev, cost: "" }));
              }}
              error={expenseErrors.cost}
              placeholder="e.g. 150"
              type="number"
            />
          </div>

          <Input
            label="Log Date"
            value={expenseValues.date}
            onChange={(e) => {
              setExpenseValues(prev => ({ ...prev, date: e.target.value }));
              if (expenseErrors.date) setExpenseErrors(prev => ({ ...prev, date: "" }));
            }}
            error={expenseErrors.date}
            type="date"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-default">
            <Button
              variant="secondary"
              onClick={() => {
                setIsExpenseModalOpen(false);
                setExpenseErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Log Expense
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FuelExpenses;
export { FuelExpenses };
