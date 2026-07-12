const db = require('../db/connection');

exports.getAll = (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM trips';
  const params = [];
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  const trips = db.prepare(query).all(params);
  res.json(trips);
};

exports.getAvailableVehicles = (req, res) => {
  const vehicles = db.prepare("SELECT * FROM vehicles WHERE status = 'Available'").all();
  res.json(vehicles);
};

exports.getAvailableDrivers = (req, res) => {
  const drivers = db.prepare("SELECT * FROM drivers WHERE status = 'Available' AND license_expiry >= date('now')").all();
  res.json(drivers);
};

exports.create = (req, res) => {
  const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance } = req.body;
  try {
    const insert = db.prepare('INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = insert.run(source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, 'Draft');
    const newTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create trip.' });
  }
};

exports.dispatch = (req, res) => {
  const { id } = req.params;
  const dispatchTx = db.transaction((tripId) => {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'Draft') throw new Error('Only Draft trips can be dispatched');

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(trip.vehicle_id);
    if (trip.cargo_weight > vehicle.capacity) {
      throw new Error('Cargo weight exceeds vehicle capacity');
    }
    if (vehicle.status !== 'Available') throw new Error('Vehicle is not available');

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(trip.driver_id);
    if (driver.status !== 'Available') throw new Error('Driver is not available');
    if (new Date(driver.license_expiry) < new Date()) throw new Error('Driver license is expired');

    db.prepare("UPDATE vehicles SET status = 'On Trip' WHERE id = ?").run(trip.vehicle_id);
    db.prepare("UPDATE drivers SET status = 'On Trip' WHERE id = ?").run(trip.driver_id);
    db.prepare("UPDATE trips SET status = 'Dispatched', dispatched_at = CURRENT_TIMESTAMP WHERE id = ?").run(tripId);
    
    return db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  });

  try {
    const result = dispatchTx(id);
    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'TRIP_DISPATCHED',
      payload: {
        tripId: result.id,
        vehicleId: result.vehicle_id,
        driverId: result.driver_id,
        newVehicleStatus: 'On Trip',
        newDriverStatus: 'On Trip'
      }
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.complete = (req, res) => {
  const { id } = req.params;
  const { final_odometer, fuel_liters, fuel_cost } = req.body;
  
  const completeTx = db.transaction((tripId) => {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be completed');

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(trip.vehicle_id);
    if (final_odometer !== undefined && final_odometer !== null && final_odometer !== '') {
      if (Number(final_odometer) < vehicle.odometer) {
        throw new Error('Final odometer cannot be less than starting odometer: ' + vehicle.odometer);
      }
      db.prepare("UPDATE vehicles SET odometer = ? WHERE id = ?").run(Number(final_odometer), trip.vehicle_id);
    }

    const activeOdometer = final_odometer ? Number(final_odometer) : vehicle.odometer;

    if (fuel_liters && fuel_cost) {
      db.prepare("INSERT INTO fuel_logs (vehicle_id, liters, cost, date, odometer_at_fill) VALUES (?, ?, ?, ?, ?)")
        .run(trip.vehicle_id, Number(fuel_liters), Number(fuel_cost), new Date().toISOString().split('T')[0], activeOdometer);
    }

    db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status != 'Retired'").run(trip.vehicle_id);
    db.prepare("UPDATE drivers SET status = 'Available' WHERE id = ? AND status != 'Suspended'").run(trip.driver_id);
    db.prepare("UPDATE trips SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").run(tripId);

    return db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  });

  try {
    const result = completeTx(id);
    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'TRIP_COMPLETED',
      payload: {
        tripId: result.id,
        vehicleId: result.vehicle_id,
        driverId: result.driver_id,
        newVehicleStatus: 'Available',
        newDriverStatus: 'Available'
      }
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancel = (req, res) => {
  const { id } = req.params;
  const cancelTx = db.transaction((tripId) => {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status === 'Completed' || trip.status === 'Cancelled') throw new Error('Cannot cancel a completed or already cancelled trip');

    if (trip.status === 'Dispatched') {
      db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ?").run(trip.vehicle_id);
      db.prepare("UPDATE drivers SET status = 'Available' WHERE id = ?").run(trip.driver_id);
    }
    
    db.prepare("UPDATE trips SET status = 'Cancelled' WHERE id = ?").run(tripId);
    return db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  });

  try {
    const result = cancelTx(id);
    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'TRIP_CANCELLED',
      payload: {
        tripId: result.id,
        vehicleId: result.vehicle_id,
        driverId: result.driver_id,
        newVehicleStatus: 'Available',
        newDriverStatus: 'Available'
      }
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

