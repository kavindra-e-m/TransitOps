import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getVehiclesAPI, createVehicleAPI, updateVehicleAPI, deleteVehicleAPI } from '../api/vehicles';
import { getDriversAPI, createDriverAPI, updateDriverAPI, updateDriverStatusAPI, deleteDriverAPI } from '../api/drivers';
import { getTripsAPI, createTripAPI, dispatchTripAPI, completeTripAPI, cancelTripAPI } from '../api/trips';
import { getMaintenanceAPI, createMaintenanceAPI, updateMaintenanceStatusAPI } from '../api/maintenance';
import { getFuelLogsAPI, createFuelLogAPI, getExpensesAPI, createExpenseAPI } from '../api/fuelExpenses';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Real-time Socket Live indicator state
  const [isLive, setIsLive] = useState(false);

  // Normalize data helpers
  const normalizeVehicles = (data) => data.map(v => ({
    id: v.id,
    regNumber: v.reg_no,
    name: v.name,
    type: v.type,
    maxLoadCapacity: v.capacity,
    odometer: v.odometer,
    acquisitionCost: v.acquisition_cost,
    status: v.status
  }));

  const normalizeDrivers = (data) => data.map(d => ({
    id: d.id,
    name: d.name,
    licenseNumber: d.license_no,
    licenseCategory: d.license_category,
    licenseExpiryDate: d.license_expiry,
    contactNumber: d.contact,
    tripCompletionPct: d.trip_completion_pct || 100,
    safetyScore: d.safety_score || 100,
    status: d.status
  }));

  const normalizeTrips = (data) => data.map(t => ({
    id: `T${String(t.id).padStart(3, '0')}`,
    rawId: t.id,
    source: t.source,
    destination: t.destination,
    vehicleId: t.vehicle_id,
    driverId: t.driver_id,
    cargoWeight: t.cargo_weight,
    plannedDistance: t.planned_distance,
    status: t.status,
    createdAt: t.created_at
  }));

  const normalizeMaintenance = (data) => data.map(m => ({
    id: m.id,
    vehicleId: m.vehicle_id,
    serviceType: m.service_type,
    cost: m.cost,
    date: m.date,
    status: m.status === 'Completed' ? 'Closed' : 'Active'
  }));

  // Fetch all data
  const refreshAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [vData, dData, tData, mData, fData, eData] = await Promise.all([
        getVehiclesAPI(),
        getDriversAPI(),
        getTripsAPI(),
        getMaintenanceAPI(),
        getFuelLogsAPI(),
        getExpensesAPI()
      ]);

      setVehicles(normalizeVehicles(vData));
      setDrivers(normalizeDrivers(dData));
      setTrips(normalizeTrips(tData));
      setMaintenance(normalizeMaintenance(mData));

      // Combine fuel logs and other expenses into a single unified list
      const combinedExpenses = [
        ...fData.map(log => ({
          id: `F-${log.id}`,
          vehicleId: log.vehicle_id,
          type: 'fuel',
          liters: log.liters,
          cost: log.cost,
          date: log.date
        })),
        ...eData.map(exp => ({
          id: `E-${exp.id}`,
          vehicleId: exp.related_vehicle_id || '',
          type: exp.category,
          cost: exp.cost,
          date: exp.date
        }))
      ];
      // Sort expenses by date descending
      combinedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(combinedExpenses);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load telemetry data", error);
    }
  }, [isAuthenticated]);

  // Real-time WebSocket connection setup using Socket.io
  useEffect(() => {
    if (isAuthenticated) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const socket = io(socketUrl, {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      socket.on('connect', () => {
        setIsLive(true);
        console.log("WebSocket connected. Setting live indicators.");
        refreshAllData();
      });

      socket.on('disconnect', () => {
        setIsLive(false);
        console.log("WebSocket disconnected. Retrying connection...");
      });

      // Handle real-time updates pushed from Express Controllers
      socket.on('telemetry_update', (event) => {
        console.log(`Real-time telemetry event received: ${event.type}`, event.payload);
        refreshAllData();
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('telemetry_update');
        socket.disconnect();
      };
    } else {
      setIsLive(false);
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setMaintenance([]);
      setExpenses([]);
    }
  }, [isAuthenticated, refreshAllData]);

  // Actions
  const addVehicle = async (vehicle) => {
    const raw = {
      reg_no: vehicle.regNumber,
      name: vehicle.name,
      type: vehicle.type,
      capacity: Number(vehicle.maxLoadCapacity),
      odometer: Number(vehicle.odometer || 0),
      acquisition_cost: Number(vehicle.acquisitionCost)
    };
    const res = await createVehicleAPI(raw);
    await refreshAllData();
    return res;
  };

  const updateVehicleStatus = async (vehicleId, status) => {
    const current = vehicles.find(v => v.id === vehicleId);
    if (!current) return;
    const raw = {
      name: current.name,
      type: current.type,
      capacity: current.maxLoadCapacity,
      odometer: current.odometer,
      acquisition_cost: current.acquisitionCost,
      status: status
    };
    await updateVehicleAPI(vehicleId, raw);
    await refreshAllData();
  };

  const updateDriverStatus = async (driverId, status) => {
    await updateDriverStatusAPI(driverId, status);
    await refreshAllData();
  };

  const updateDriversStatusBulk = async (driverIds, status) => {
    await Promise.all(driverIds.map(id => updateDriverStatusAPI(id, status)));
    await refreshAllData();
  };

  const dispatchTrip = async (tripData) => {
    const raw = {
      source: tripData.source,
      destination: tripData.destination,
      vehicle_id: Number(tripData.vehicleId),
      driver_id: Number(tripData.driverId),
      cargo_weight: Number(tripData.cargoWeight),
      planned_distance: Number(tripData.plannedDistance)
    };
    
    // 1. Create Draft Trip
    const newTrip = await createTripAPI(raw);
    // 2. Dispatch Trip
    const dispatched = await dispatchTripAPI(newTrip.id);
    await refreshAllData();
    return dispatched;
  };

  const completeTrip = async (tripId, data = {}) => {
    const rawId = typeof tripId === 'string' ? Number(tripId.replace('T', '')) : tripId;
    const rawData = {
      final_odometer: data.finalOdometer,
      fuel_liters: data.fuelLiters,
      fuel_cost: data.fuelCost
    };
    await completeTripAPI(rawId, rawData);
    await refreshAllData();
  };

  const deleteVehicle = async (vehicleId) => {
    await deleteVehicleAPI(vehicleId);
    await refreshAllData();
  };

  const createDriver = async (driver) => {
    const raw = {
      name: driver.name,
      license_no: driver.licenseNumber,
      license_category: driver.licenseCategory,
      license_expiry: driver.licenseExpiryDate,
      contact: driver.contactNumber
    };
    const res = await createDriverAPI(raw);
    await refreshAllData();
    return res;
  };

  const updateDriver = async (id, driver) => {
    const raw = {
      name: driver.name,
      license_category: driver.licenseCategory,
      license_expiry: driver.licenseExpiryDate,
      contact: driver.contactNumber
    };
    const res = await updateDriverAPI(id, raw);
    await refreshAllData();
    return res;
  };

  const deleteDriver = async (driverId) => {
    await deleteDriverAPI(driverId);
    await refreshAllData();
  };

  const cancelTrip = async (tripId) => {
    const rawId = typeof tripId === 'string' ? Number(tripId.replace('T', '')) : tripId;
    await cancelTripAPI(rawId);
    await refreshAllData();
  };

  const addMaintenanceRecord = async (record) => {
    const raw = {
      vehicle_id: Number(record.vehicleId),
      service_type: record.serviceType,
      cost: Number(record.cost),
      date: record.date,
      status: record.status === 'Closed' ? 'Completed' : 'In Progress'
    };
    const res = await createMaintenanceAPI(raw);
    await refreshAllData();
    return res;
  };

  const closeMaintenanceRecord = async (recordId) => {
    await updateMaintenanceStatusAPI(recordId, 'Completed');
    await refreshAllData();
  };

  const addExpense = async (expense) => {
    if (expense.type === 'fuel') {
      const veh = vehicles.find(v => v.id === Number(expense.vehicleId));
      const currentOdo = veh ? veh.odometer : 0;
      
      const raw = {
        vehicle_id: Number(expense.vehicleId),
        liters: Number(expense.liters),
        cost: Number(expense.cost),
        date: expense.date,
        odometer_at_fill: currentOdo
      };
      await createFuelLogAPI(raw);
    } else {
      const raw = {
        category: expense.type,
        description: expense.type,
        cost: Number(expense.cost),
        date: expense.date,
        related_vehicle_id: expense.vehicleId ? Number(expense.vehicleId) : null
      };
      await createExpenseAPI(raw);
    }
    await refreshAllData();
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenance,
        expenses,
        lastUpdated,
        isLive,
        refreshAllData,
        addVehicle,
        updateVehicleStatus,
        updateDriverStatus,
        updateDriversStatusBulk,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        addMaintenanceRecord,
        closeMaintenanceRecord,
        addExpense,
        deleteVehicle,
        createDriver,
        updateDriver,
        deleteDriver
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

export const useIsLive = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useIsLive must be used within AppProvider");
  return context.isLive;
};

export const useAppActions = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppActions must be used within AppProvider");
  return {
    refreshAllData: context.refreshAllData,
    addVehicle: context.addVehicle,
    updateVehicleStatus: context.updateVehicleStatus,
    updateDriverStatus: context.updateDriverStatus,
    updateDriversStatusBulk: context.updateDriversStatusBulk,
    dispatchTrip: context.dispatchTrip,
    completeTrip: context.completeTrip,
    cancelTrip: context.cancelTrip,
    addMaintenanceRecord: context.addMaintenanceRecord,
    closeMaintenanceRecord: context.closeMaintenanceRecord,
    addExpense: context.addExpense,
    deleteVehicle: context.deleteVehicle,
    createDriver: context.createDriver,
    updateDriver: context.updateDriver,
    deleteDriver: context.deleteDriver
  };
};
