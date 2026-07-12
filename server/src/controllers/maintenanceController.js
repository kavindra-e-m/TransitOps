const db = require('../db/connection');

exports.getAll = (req, res) => {
  const logs = db.prepare('SELECT * FROM maintenance_logs').all();
  res.json(logs);
};

exports.create = (req, res) => {
  const { vehicle_id, service_type, cost, date, status } = req.body;
  const maintenanceTx = db.transaction(() => {
    const insert = db.prepare('INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, status) VALUES (?, ?, ?, ?, ?)');
    const info = insert.run(vehicle_id, service_type, cost, date, status || 'Scheduled');
    
    if (['Scheduled', 'In Progress'].includes(status || 'Scheduled')) {
      db.prepare("UPDATE vehicles SET status = 'In Shop' WHERE id = ?").run(vehicle_id);
    } else if (status === 'Completed') {
      db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status != 'Retired'").run(vehicle_id);
    }

    return db.prepare('SELECT * FROM maintenance_logs WHERE id = ?').get(info.lastInsertRowid);
  });

  try {
    const result = maintenanceTx();
    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'MAINTENANCE_CREATED',
      payload: {
        vehicleId: result.vehicle_id,
        newVehicleStatus: ['Scheduled', 'In Progress'].includes(result.status) ? 'In Shop' : 'Available'
      }
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create maintenance log.' });
  }
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const updateTx = db.transaction(() => {
    const log = db.prepare('SELECT * FROM maintenance_logs WHERE id = ?').get(id);
    if (!log) throw new Error('Maintenance log not found');

    db.prepare('UPDATE maintenance_logs SET status = ? WHERE id = ?').run(status, id);

    if (['Scheduled', 'In Progress'].includes(status)) {
      db.prepare("UPDATE vehicles SET status = 'In Shop' WHERE id = ?").run(log.vehicle_id);
    } else if (status === 'Completed') {
      db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status != 'Retired'").run(log.vehicle_id);
    }

    return db.prepare('SELECT * FROM maintenance_logs WHERE id = ?').get(id);
  });

  try {
    const result = updateTx();
    const io = req.app.get('io');
    io.emit('telemetry_update', {
      type: 'MAINTENANCE_CLOSED',
      payload: {
        vehicleId: result.vehicle_id,
        newVehicleStatus: result.status === 'Completed' ? 'Available' : 'In Shop'
      }
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


