import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Fuel, DollarSign, Calendar, Truck, AlertTriangle } from 'lucide-react';

import { useExpenses, useVehicles, useTrips, useAppActions } from '../context/AppContext';
import { detectFuelAnomalies } from '../utils/insights';
import { usePermission } from '../hooks/usePermission';
import KPICard from '../components/common/KPICard';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const FuelExpenses = () => {
  const expenses = useExpenses();
  const vehicles = useVehicles();
  const trips = useTrips();
  const { addExpense } = useAppActions();
  const { canEdit } = usePermission('fuelExpenses');

  // Filters State
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("All");

  // Modals state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms values
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

  // Feature 7: Detect Fuel Refill Anomalies
  const analyzedFuelLogs = useMemo(() => {
    const fuelLogs = expenses.filter(e => e.type === 'fuel');
    return detectFuelAnomalies(fuelLogs, expenses, trips, vehicles);
  }, [expenses, trips, vehicles]);

  const analyzedExpenses = useMemo(() => {
    return expenses.map(exp => {
      if (exp.type === 'fuel') {
        const found = analyzedFuelLogs.find(f => f.id === exp.id);
        return found || exp;
      }
      return exp;
    });
  }, [expenses, analyzedFuelLogs]);

  // Calculations
  const totalCost = useMemo(() => {
    return expenses
      .filter(exp => selectedVehicleFilter === "All" || exp.vehicleId === Number(selectedVehicleFilter))
      .reduce((acc, exp) => acc + exp.cost, 0);
  }, [expenses, selectedVehicleFilter]);

  const fuelCostSum = useMemo(() => {
    return expenses
      .filter(exp => exp.type === 'fuel' && (selectedVehicleFilter === "All" || exp.vehicleId === Number(selectedVehicleFilter)))
      .reduce((acc, exp) => acc + exp.cost, 0);
  }, [expenses, selectedVehicleFilter]);

  const auxiliaryCostSum = useMemo(() => {
    return expenses
      .filter(exp => exp.type !== 'fuel' && (selectedVehicleFilter === "All" || exp.vehicleId === Number(selectedVehicleFilter)))
      .reduce((acc, exp) => acc + exp.cost, 0);
  }, [expenses, selectedVehicleFilter]);

  // Form input changes handlers
  const handleFuelChange = (e) => {
    const { name, value } = e.target;
    setFuelValues(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseValues(prev => ({ ...prev, [name]: value }));
  };

  // Submit fuel log action
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!fuelValues.vehicleId) errors.vehicleId = "Please select a vehicle";
    if (!fuelValues.liters || isNaN(fuelValues.liters) || Number(fuelValues.liters) <= 0) {
      errors.liters = "Must be a positive volume (liters)";
    }
    if (!fuelValues.cost || isNaN(fuelValues.cost) || Number(fuelValues.cost) <= 0) {
      errors.cost = "Must be a positive cost ($)";
    }
    if (!fuelValues.date) errors.date = "Date of fill is required";

    if (Object.keys(errors).length > 0) {
      setFuelErrors(errors);
      return;
    }

    try {
      await addExpense({
        vehicleId: fuelValues.vehicleId,
        type: "fuel",
        liters: Number(fuelValues.liters),
        cost: Number(fuelValues.cost),
        date: fuelValues.date
      });
      toast.success("Fuel refill log recorded successfully.");
      
      // Reset
      setFuelValues({
        vehicleId: "",
        liters: "",
        cost: "",
        date: new Date().toISOString().split('T')[0]
      });
      setFuelErrors({});
      setIsFuelModalOpen(false);
    } catch {
      // Toast interceptor handles
    }
  };

  // Submit auxiliary expense log
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!expenseValues.cost || isNaN(expenseValues.cost) || Number(expenseValues.cost) <= 0) {
      errors.cost = "Must be a positive cost ($)";
    }
    if (!expenseValues.date) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setExpenseErrors(errors);
      return;
    }

    try {
      await addExpense({
        vehicleId: expenseValues.vehicleId || null,
        type: expenseValues.type,
        cost: Number(expenseValues.cost),
        date: expenseValues.date
      });
      toast.success(`${expenseValues.type.toUpperCase()} expense log recorded.`);
      
      // Reset
      setExpenseValues({
        vehicleId: "",
        type: "toll",
        cost: "",
        date: new Date().toISOString().split('T')[0]
      });
      setExpenseErrors({});
      setIsExpenseModalOpen(false);
    } catch {
      // handled
    }
  };

  // Table Column Definitions
  const columns = [
    { key: "id", label: "Tx ID", width: "10%" },
    { 
      key: "vehicleId", 
      label: "Vehicle", 
      render: (row) => {
        const v = vehicles.find(veh => veh.id === Number(row.vehicleId));
        return <span className="font-semibold font-mono">{v ? v.regNumber : (row.vehicleId || 'N/A')}</span>;
      }
    },
    { 
      key: "type", 
      label: "Category", 
      render: (row) => {
        const isFuel = row.type === 'fuel';
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
            isFuel ? 'bg-status-available/10 text-status-available border border-status-available/20' : 
            row.type === 'repair' ? 'bg-status-shop/10 text-status-shop border border-status-shop/20' :
            'bg-status-dispatched/10 text-status-dispatched border border-status-dispatched/20'
          }`}>
            {row.type}
          </span>
        );
      }
    },
    { 
      key: "detail", 
      label: "Log Detail", 
      render: (row) => {
        const isFuel = row.type === 'fuel';
        const isAnomaly = row.anomaly?.flagged;
        return (
          <div className="flex flex-col">
            {isFuel ? (
              <span className="font-mono text-secondary">{row.liters} liters filled</span>
            ) : (
              <span className="text-secondary capitalize">{row.type} Log</span>
            )}
            {isAnomaly && (
              <div className="mt-1 space-y-0.5 select-none max-w-sm">
                {row.anomaly.reasons.map((r, i) => (
                  <span key={i} className="flex items-start gap-1 text-[9px] text-[#F97316] font-semibold font-sans leading-tight">
                    <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }
    },
    { key: "cost", label: "Amount Charged", render: (row) => <span className="font-mono font-semibold">${row.cost.toLocaleString()}</span> },
    { key: "date", label: "Logged Date", render: (row) => <span className="font-mono">{row.date}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-primary">Fuel & Expenses</h2>
          <p className="text-xs text-secondary">Log fuel refills and other auxiliary route costs to audit operational spendings.</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsFuelModalOpen(true)} className="bg-status-available/15 hover:bg-status-available/25 border border-status-available/30 text-status-available">
              <Fuel size={16} />
              Refill Fuel
            </Button>
            <Button onClick={() => setIsExpenseModalOpen(true)}>
              <DollarSign size={16} />
              Log Expense
            </Button>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <KPICard label="Total Spendings" value={`$${totalCost.toLocaleString()}`} color="amber" />
        <KPICard label="Fuel Costs" value={`$${fuelCostSum.toLocaleString()}`} color="green" />
        <KPICard label="Auxiliary Costs (Toll/Repairs)" value={`$${auxiliaryCostSum.toLocaleString()}`} color="blue" />
      </div>

      {/* Financial Rule Warning */}
      <div className="bg-[#EF4444]/10 border-l-[3.5px] border-[#EF4444] p-3.5 rounded-lg flex items-center gap-3 select-none">
        <div className="w-5 h-5 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] font-bold">
          !
        </div>
        <p className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-wider">
          Financial Rule: Total Operational Cost = SUM(fuel.cost) + SUM(expenses where type=repair/maintenance).
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex justify-between items-center bg-card border border-default p-4 rounded-xl select-none">
        <div className="flex items-center gap-3 w-full max-w-xs">
          <label className="text-xs font-semibold text-secondary whitespace-nowrap">Filter by Vehicle:</label>
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-input border border-default text-xs text-primary rounded-lg focus:outline-none focus:border-focus"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.regNumber}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted hidden sm:inline">
          {expenses.length} transaction entries logged
        </span>
      </div>

      {/* Expenses Table */}
      <DataTable
        columns={columns}
        data={analyzedExpenses.filter(exp => selectedVehicleFilter === "All" || exp.vehicleId === Number(selectedVehicleFilter))}
        emptyMessage="No transaction logs recorded."
      />

      {/* Refill Fuel Modal */}
      <Modal
        isOpen={isFuelModalOpen}
        onClose={() => {
          setIsFuelModalOpen(false);
          setFuelErrors({});
        }}
        title="Log Fuel Refill Event"
      >
        <form onSubmit={handleFuelSubmit} className="space-y-4 font-sans">
          {/* Vehicle Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary select-none">
              Fleet Vehicle Refilled
            </label>
            <select
              name="vehicleId"
              value={fuelValues.vehicleId}
              onChange={handleFuelChange}
              className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
            >
              <option value="">-- Select Fleet Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
              ))}
            </select>
            {fuelErrors.vehicleId && <p className="text-[10px] text-status-retired font-medium">{fuelErrors.vehicleId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fuel Volume (Liters)"
              name="liters"
              value={fuelValues.liters}
              onChange={handleFuelChange}
              error={fuelErrors.liters}
              placeholder="e.g. 80"
              type="number"
            />
            <Input
              label="Refill Spendings ($)"
              name="cost"
              value={fuelValues.cost}
              onChange={handleFuelChange}
              error={fuelErrors.cost}
              placeholder="e.g. 120"
              type="number"
            />
          </div>

          <Input
            label="Date of Fill"
            name="date"
            value={fuelValues.date}
            onChange={handleFuelChange}
            error={fuelErrors.date}
            type="date"
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-default select-none">
            <Button variant="secondary" onClick={() => setIsFuelModalOpen(false)}>Cancel</Button>
            <Button type="submit">Log Refill</Button>
          </div>
        </form>
      </Modal>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseErrors({});
        }}
        title="Log Route Expense Event"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4 font-sans">
          
          {/* Related Vehicle (Optional) Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary select-none">
              Assigned Vehicle (Optional)
            </label>
            <select
              name="vehicleId"
              value={expenseValues.vehicleId}
              onChange={handleExpenseChange}
              className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
            >
              <option value="">-- No Vehicle Assigned --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
              ))}
            </select>
          </div>

          {/* Expense type dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary select-none">
              Expense Category
            </label>
            <select
              name="type"
              value={expenseValues.type}
              onChange={handleExpenseChange}
              className="w-full px-3 py-2 bg-input text-[#E5E7EB] text-sm rounded-lg border border-default focus:outline-none focus:border-focus transition-all duration-200"
            >
              <option value="toll">Toll Gate Charge</option>
              <option value="repair">Minor Workshop Repair</option>
              <option value="other">Other Route Costs</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Charged Amount ($)"
              name="cost"
              value={expenseValues.cost}
              onChange={handleExpenseChange}
              error={expenseErrors.cost}
              placeholder="e.g. 45"
              type="number"
            />
            <Input
              label="Transaction Date"
              name="date"
              value={expenseValues.date}
              onChange={handleExpenseChange}
              error={expenseErrors.date}
              type="date"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-default select-none">
            <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
            <Button type="submit">Log Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FuelExpenses;
export { FuelExpenses };
