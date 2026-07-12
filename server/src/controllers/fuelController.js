const db = require('../db/connection');

exports.getAll = (req, res) => {
  const logs = db.prepare('SELECT * FROM fuel_logs').all();
  res.json(logs);
};

exports.create = (req, res) => {
  const { vehicle_id, liters, cost, date, odometer_at_fill } = req.body;
  try {
    const insert = db.prepare('INSERT INTO fuel_logs (vehicle_id, liters, cost, date, odometer_at_fill) VALUES (?, ?, ?, ?, ?)');
    const info = insert.run(vehicle_id, liters, cost, date, odometer_at_fill);
    
    const newLog = db.prepare('SELECT * FROM fuel_logs WHERE id = ?').get(info.lastInsertRowid);
    
    // Calculate new total operational cost for socket payload
    const fuelCost = db.prepare('SELECT SUM(cost) as total FROM fuel_logs').get().total || 0;
    const maintenanceCost = db.prepare('SELECT SUM(cost) as total FROM maintenance_logs').get().total || 0;
    const expensesCost = db.prepare('SELECT SUM(cost) as total FROM expenses').get().total || 0;
    const totalOperationalCost = fuelCost + maintenanceCost + expensesCost;

    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'COST_UPDATED',
      payload: {
        vehicleId: vehicle_id,
        newTotalOperationalCost: totalOperationalCost
      }
    });

    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fuel log.' });
  }
};

