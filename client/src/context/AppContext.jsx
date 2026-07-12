import React, { createContext, useContext, useState } from 'react';
import { initialVehicles } from '../mock/vehicles';
import { initialDrivers } from '../mock/drivers';
import { initialTrips } from '../mock/trips';
import { initialMaintenance } from '../mock/maintenance';
import { initialFuelExpenses } from '../mock/fuelExpenses';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [trips, setTrips] = useState(initialTrips);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [expenses, setExpenses] = useState(initialFuelExpenses);

  // Vehicle Actions
  const addVehicle = (vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
      odometer: Number(vehicle.odometer || 0),
      maxLoadCapacity: Number(vehicle.maxLoadCapacity || 0),
      acquisitionCost: Number(vehicle.acquisitionCost || 0),
      status: vehicle.status || 'Available'
    };
    setVehicles((prev) => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicleStatus = (vehicleId, status) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    );
  };

  // Driver Actions
  const updateDriverStatus = (driverId, status) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status } : d))
    );
  };

  const updateDriversStatusBulk = (driverIds, status) => {
    setDrivers((prev) =>
      prev.map((d) => (driverIds.includes(d.id) ? { ...d, status } : d))
    );
  };

  // Trip Actions
  const dispatchTrip = (tripData) => {
    const newTrip = {
      id: `T${String(trips.length + 1).padStart(3, '0')}`,
      source: tripData.source,
      destination: tripData.destination,
      vehicleId: tripData.vehicleId,
      driverId: tripData.driverId,
      cargoWeight: Number(tripData.cargoWeight),
      plannedDistance: Number(tripData.plannedDistance),
      status: 'Dispatched',
      createdAt: new Date().toISOString()
    };

    // Update statuses
    setVehicles((prev) =>
      prev.map((v) => (v.id === tripData.vehicleId ? { ...v, status: 'On Trip' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === tripData.driverId ? { ...d, status: 'On Trip' } : d))
    );
    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  };

  const completeTrip = (tripId) => {
    let tripToUpdate;
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          tripToUpdate = t;
          return { ...t, status: 'Completed' };
        }
        return t;
      })
    );

    if (tripToUpdate) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === tripToUpdate.vehicleId ? { ...v, status: 'Available' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.id === tripToUpdate.driverId ? { ...d, status: 'Available' } : d))
      );
    }
  };

  const cancelTrip = (tripId) => {
    let tripToUpdate;
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          tripToUpdate = t;
          return { ...t, status: 'Cancelled' };
        }
        return t;
      })
    );

    if (tripToUpdate) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === tripToUpdate.vehicleId ? { ...v, status: 'Available' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.id === tripToUpdate.driverId ? { ...d, status: 'Available' } : d))
      );
    }
  };

  // Maintenance Actions
  const addMaintenanceRecord = (record) => {
    const newRecord = {
      ...record,
      id: `M${String(maintenance.length + 1).padStart(3, '0')}`,
      cost: Number(record.cost || 0),
      date: record.date || new Date().toISOString().split('T')[0]
    };

    setMaintenance((prev) => [newRecord, ...prev]);

    // cascading rule: if maintenance is active, set vehicle to "In Shop"
    if (newRecord.status === 'Active') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === newRecord.vehicleId ? { ...v, status: 'In Shop' } : v))
      );
    }
    return newRecord;
  };

  const closeMaintenanceRecord = (recordId) => {
    let recordToUpdate;
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === recordId) {
          recordToUpdate = m;
          return { ...m, status: 'Closed' };
        }
        return m;
      })
    );

    if (recordToUpdate) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === recordToUpdate.vehicleId ? { ...v, status: 'Available' } : v))
      );
    }
  };

  // Fuel & Expense Actions
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: `E${String(expenses.length + 1).padStart(3, '0')}`,
      cost: Number(expense.cost),
      liters: expense.liters ? Number(expense.liters) : undefined,
      date: expense.date || new Date().toISOString().split('T')[0]
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenance,
        expenses,
        addVehicle,
        updateVehicleStatus,
        updateDriverStatus,
        updateDriversStatusBulk,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        addMaintenanceRecord,
        closeMaintenanceRecord,
        addExpense
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useVehicles must be used within AppProvider");
  return context.vehicles;
};

export const useDrivers = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useDrivers must be used within AppProvider");
  return context.drivers;
};

export const useTrips = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useTrips must be used within AppProvider");
  return context.trips;
};

export const useMaintenance = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useMaintenance must be used within AppProvider");
  return context.maintenance;
};

export const useExpenses = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useExpenses must be used within AppProvider");
  return context.expenses;
};

export const useAppActions = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppActions must be used within AppProvider");
  return {
    addVehicle: context.addVehicle,
    updateVehicleStatus: context.updateVehicleStatus,
    updateDriverStatus: context.updateDriverStatus,
    updateDriversStatusBulk: context.updateDriversStatusBulk,
    dispatchTrip: context.dispatchTrip,
    completeTrip: context.completeTrip,
    cancelTrip: context.cancelTrip,
    addMaintenanceRecord: context.addMaintenanceRecord,
    closeMaintenanceRecord: context.closeMaintenanceRecord,
    addExpense: context.addExpense
  };
};
