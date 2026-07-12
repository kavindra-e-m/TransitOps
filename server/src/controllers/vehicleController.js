const db = require('../db/connection');

exports.getAll = (req, res) => {
  const { type, status, region } = req.query;
  let query = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const vehicles = db.prepare(query).all(params);
  res.json(vehicles);
};

exports.checkReg = (req, res) => {
  const { regNo } = req.params;
  const vehicle = db.prepare('SELECT id FROM vehicles WHERE reg_no = ?').get(regNo);
  res.json({ isUnique: !vehicle });
};

exports.create = (req, res) => {
  const { reg_no, name, type, capacity, odometer, acquisition_cost } = req.body;
  try {
    const existing = db.prepare('SELECT id FROM vehicles WHERE reg_no = ?').get(reg_no);
    if (existing) return res.status(400).json({ error: 'Registration number already exists.' });

    const insert = db.prepare('INSERT INTO vehicles (reg_no, name, type, capacity, odometer, acquisition_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = insert.run(reg_no, name, type, capacity, odometer || 0, acquisition_cost, 'Available');
    
    const newVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(info.lastInsertRowid);
    
    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'VEHICLE_UPDATED', payload: newVehicle });

    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vehicle.' });
  }
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, type, capacity, odometer, acquisition_cost, status } = req.body;
  try {
    const update = db.prepare('UPDATE vehicles SET name = ?, type = ?, capacity = ?, odometer = ?, acquisition_cost = ?, status = ? WHERE id = ?');
    update.run(name, type, capacity, odometer, acquisition_cost, status, id);
    const updated = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' });

    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'VEHICLE_UPDATED', payload: updated });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle.' });
  }
};


exports.getHistory = (req, res) => {
  const { id } = req.params;
  const trips = db.prepare('SELECT * FROM trips WHERE vehicle_id = ? ORDER BY created_at DESC').all(id);
  const maintenance = db.prepare('SELECT * FROM maintenance_logs WHERE vehicle_id = ? ORDER BY date DESC').all(id);
  res.json({ trips, maintenance });
};
