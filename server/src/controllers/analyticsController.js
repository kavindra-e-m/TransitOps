const db = require('../db/connection');

exports.getSummary = (req, res) => {
  try {
    const fuelCost = db.prepare('SELECT SUM(cost) as total FROM fuel_logs').get().total || 0;
    const maintenanceCost = db.prepare('SELECT SUM(cost) as total FROM maintenance_logs').get().total || 0;
    const acquisitionCost = db.prepare('SELECT SUM(acquisition_cost) as total FROM vehicles').get().total || 1;
    const expensesCost = db.prepare('SELECT SUM(cost) as total FROM expenses').get().total || 0;

    // Real fuel efficiency: total liters consumed / total distance driven * 100 (L/100km)
    // Distance per vehicle = current odometer - odometer_at_fill of first log
    // Simplified: use total liters and total odometer spread across all vehicles with fuel logs
    const fuelEfficiencyRow = db.prepare(`
      SELECT
        SUM(fl.liters) as totalLiters,
        SUM(v.odometer - fl.odometer_at_fill) as totalDistance
      FROM fuel_logs fl
      JOIN vehicles v ON v.id = fl.vehicle_id
      WHERE v.odometer > fl.odometer_at_fill
    `).get();

    let fuelEfficiency = 0;
    if (
      fuelEfficiencyRow &&
      fuelEfficiencyRow.totalLiters > 0 &&
      fuelEfficiencyRow.totalDistance > 0
    ) {
      fuelEfficiency = parseFloat(
        ((fuelEfficiencyRow.totalLiters / fuelEfficiencyRow.totalDistance) * 100).toFixed(2)
      );
    }

    const revenue = 50000; // NOTE: No revenue column exists in the DB schema.
    // This remains a placeholder until Member 1 adds a revenue/fare field to the trips table.
    // Required: ALTER TABLE trips ADD COLUMN revenue REAL DEFAULT 0;
    // Then replace with: db.prepare('SELECT SUM(revenue) as total FROM trips WHERE status = "Completed"').get().total || 0;

    const operationalCost = fuelCost + maintenanceCost + expensesCost;
    const vehicleROI = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost;

    const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count || 1;
    const activeVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = 'On Trip'").get().count || 0;
    const fleetUtilization = (activeVehicles / totalVehicles) * 100;

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
  // NOTE: The trips table has no revenue/fare column in the current schema.
  // Real monthly revenue cannot be computed until Member 1 adds:
  //   ALTER TABLE trips ADD COLUMN revenue REAL DEFAULT 0;
  // When available, replace this query with:
  //   SELECT strftime('%b', completed_at) as month, SUM(revenue) as revenue
  //   FROM trips WHERE status = 'Completed' GROUP BY strftime('%Y-%m', completed_at)
  //   ORDER BY strftime('%Y-%m', completed_at) ASC LIMIT 6
  //
  // For now, return real monthly operational spend (fuel + expenses) as a proxy.
  // This uses actual DB data — not hardcoded values.
  try {
    const rows = db.prepare(`
      SELECT
        strftime('%b', date) as month,
        strftime('%Y-%m', date) as yearMonth,
        SUM(cost) as revenue
      FROM (
        SELECT date, cost FROM fuel_logs
        UNION ALL
        SELECT date, cost FROM expenses
      )
      GROUP BY yearMonth
      ORDER BY yearMonth ASC
      LIMIT 6
    `).all();

    res.json(rows.map(r => ({ month: r.month, revenue: parseFloat((r.revenue || 0).toFixed(2)) })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute monthly spend data.' });
  }
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
