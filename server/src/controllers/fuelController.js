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
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fuel log.' });
  }
};
