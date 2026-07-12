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
      db.prepare("UPDATE vehicles SET status = 'Available' WHERE id = ?").run(vehicle_id);
    }

    return db.prepare('SELECT * FROM maintenance_logs WHERE id = ?').get(info.lastInsertRowid);
  });

  try {
    const result = maintenanceTx();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create maintenance log.' });
  }
};
