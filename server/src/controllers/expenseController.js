const db = require('../db/connection');

exports.getAll = (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses').all();
  res.json(expenses);
};

exports.create = (req, res) => {
  const { category, description, cost, date, related_vehicle_id } = req.body;
  try {
    const insert = db.prepare('INSERT INTO expenses (category, description, cost, date, related_vehicle_id) VALUES (?, ?, ?, ?, ?)');
    const info = insert.run(category, description, cost, date, related_vehicle_id || null);
    
    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense.' });
  }
};

exports.getOperationalCost = (req, res) => {
  try {
    const fuelCost = db.prepare('SELECT SUM(cost) as total FROM fuel_logs').get().total || 0;
    const maintenanceCost = db.prepare('SELECT SUM(cost) as total FROM maintenance_logs').get().total || 0;
    const expensesCost = db.prepare('SELECT SUM(cost) as total FROM expenses').get().total || 0;
    
    const totalOperationalCost = fuelCost + maintenanceCost + expensesCost;
    res.json({ totalOperationalCost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate operational cost.' });
  }
};
