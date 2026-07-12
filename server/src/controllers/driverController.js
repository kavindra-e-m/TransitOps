const db = require('../db/connection');

exports.getAll = (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers').all();
  res.json(drivers);
};

exports.create = (req, res) => {
  const { name, license_no, license_category, license_expiry, contact } = req.body;
  try {
    const existing = db.prepare('SELECT id FROM drivers WHERE license_no = ?').get(license_no);
    if (existing) return res.status(400).json({ error: 'License number already exists.' });

    const insert = db.prepare('INSERT INTO drivers (name, license_no, license_category, license_expiry, contact, status) VALUES (?, ?, ?, ?, ?, ?)');
    const info = insert.run(name, license_no, license_category, license_expiry, contact, 'Available');
    
    const newDriver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(info.lastInsertRowid);
    
    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'DRIVER_UPDATED', payload: newDriver });

    res.status(201).json(newDriver);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create driver.' });
  }
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, license_category, license_expiry, contact } = req.body;
  try {
    const update = db.prepare('UPDATE drivers SET name = ?, license_category = ?, license_expiry = ?, contact = ? WHERE id = ?');
    update.run(name, license_category, license_expiry, contact, id);
    const updated = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);
    if (!updated) return res.status(404).json({ error: 'Driver not found' });

    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'DRIVER_UPDATED', payload: updated });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update driver.' });
  }
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const driver = db.prepare('SELECT license_expiry FROM drivers WHERE id = ?').get(id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    if (['Available', 'On Trip'].includes(status)) {
      if (new Date(driver.license_expiry) < new Date()) {
        return res.status(400).json({ error: 'Cannot set status to Available/On Trip. License is expired.' });
      }
    }

    db.prepare('UPDATE drivers SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);

    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'DRIVER_UPDATED', payload: updated });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

exports.delete = (req, res) => {
  const { id } = req.params;
  try {
    // Check if driver has active dispatched trips
    const activeTrips = db.prepare("SELECT id FROM trips WHERE driver_id = ? AND status = 'Dispatched'").get(id);
    if (activeTrips) {
      return res.status(400).json({ error: 'Cannot delete driver with active dispatched trips.' });
    }

    db.prepare('DELETE FROM drivers WHERE id = ?').run(id);
    const io = req.app.get('io');
    io.emit('telemetry_update', { type: 'DRIVER_DELETED', payload: { id: Number(id) } });
    res.json({ message: 'Driver deleted successfully.', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete driver.' });
  }
};

