const db = require('../db/connection');

exports.getSummary = (req, res) => {
  try {
    const fuelCost = db.prepare('SELECT SUM(cost) as total FROM fuel_logs').get().total || 0;
    const maintenanceCost = db.prepare('SELECT SUM(cost) as total FROM maintenance_logs').get().total || 0;
    const acquisitionCost = db.prepare('SELECT SUM(acquisition_cost) as total FROM vehicles').get().total || 1; // avoid / 0
    const expensesCost = db.prepare('SELECT SUM(cost) as total FROM expenses').get().total || 0;
    
    // For mock purposes, assume some static revenue, or we could calculate if revenue is added to trips. Let's assume static 50000 for realistic ROI.
    const revenue = 50000;
    
    const operationalCost = fuelCost + maintenanceCost + expensesCost;
    const vehicleROI = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost;
    
    // fleet utilization: active vehicles / total vehicles
    const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count || 1;
    const activeVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = 'On Trip'").get().count || 0;
    const fleetUtilization = (activeVehicles / totalVehicles) * 100;
    
    // fuel efficiency placeholder (e.g., avg liters / 100km, assuming data would support it)
    const fuelEfficiency = 12.5; 

    res.json({
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      vehicleROI,
      formulaFields: {
        revenue,
        maintenance: maintenanceCost,
        fuel: fuelCost,
        acquisitionCost
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute analytics.' });
  }
};

exports.getMonthlyRevenue = (req, res) => {
  // Return static shaped data for chart
  res.json([
    { month: 'Jan', revenue: 1000 },
    { month: 'Feb', revenue: 1200 },
    { month: 'Mar', revenue: 1500 },
    { month: 'Apr', revenue: 1800 },
    { month: 'May', revenue: 2000 },
    { month: 'Jun', revenue: 2400 }
  ]);
};

exports.getTopCostliestVehicles = (req, res) => {
  try {
    const query = `
      SELECT v.id as vehicle_id, v.reg_no, 
             COALESCE((SELECT SUM(cost) FROM maintenance_logs m WHERE m.vehicle_id = v.id), 0) +
             COALESCE((SELECT SUM(cost) FROM fuel_logs f WHERE f.vehicle_id = v.id), 0) as totalCost
      FROM vehicles v
      ORDER BY totalCost DESC
      LIMIT 5
    `;
    const data = db.prepare(query).all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get top costliest vehicles.' });
  }
};
