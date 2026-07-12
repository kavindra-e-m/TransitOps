const db = require('./connection');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const seedData = () => {
  console.log('Seeding database...');
  
  // Read and execute schema.sql
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Clear existing data (in reverse dependency order to respect FKs)
  db.prepare('DELETE FROM expenses').run();
  db.prepare('DELETE FROM fuel_logs').run();
  db.prepare('DELETE FROM maintenance_logs').run();
  db.prepare('DELETE FROM trips').run();
  db.prepare('DELETE FROM drivers').run();
  db.prepare('DELETE FROM vehicles').run();
  db.prepare('DELETE FROM users').run();

  // Insert Users
  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
  const defaultPassword = bcrypt.hashSync('password123', 10);
  insertUser.run('Fleet Admin', 'manager@transitops.com', defaultPassword, 'Fleet Manager');
  insertUser.run('Dispatch Dan', 'dispatcher@transitops.com', defaultPassword, 'Dispatcher');
  insertUser.run('Safety Sue', 'safety@transitops.com', defaultPassword, 'Safety Officer');
  insertUser.run('Finance Phil', 'finance@transitops.com', defaultPassword, 'Financial Analyst');

  // Insert Vehicles
  const insertVehicle = db.prepare('INSERT INTO vehicles (reg_no, name, type, capacity, odometer, acquisition_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const v1 = insertVehicle.run('VAN-05', 'Ford Transit', 'Van', 1500, 12000, 35000, 'Available').lastInsertRowid;
  const v2 = insertVehicle.run('TRK-10', 'Volvo FH16', 'Truck', 15000, 45000, 120000, 'On Trip').lastInsertRowid;
  const v3 = insertVehicle.run('VAN-08', 'Mercedes Sprinter', 'Van', 1800, 8500, 40000, 'In Shop').lastInsertRowid;

  // Insert Drivers
  const insertDriver = db.prepare('INSERT INTO drivers (name, license_no, license_category, license_expiry, contact, status) VALUES (?, ?, ?, ?, ?, ?)');
  const d1 = insertDriver.run('Alex Mercer', 'LIC-1234', 'Class B', '2028-12-31', '555-0101', 'Available').lastInsertRowid;
  const d2 = insertDriver.run('John Doe', 'LIC-9999', 'Class A', '2025-03-01', '555-0102', 'Available').lastInsertRowid; // Expired
  const d3 = insertDriver.run('Sarah Connor', 'LIC-5678', 'Class A', '2027-06-15', '555-0103', 'On Trip').lastInsertRowid;

  // Insert Trips
  const insertTrip = db.prepare('INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, dispatched_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertTrip.run('Warehouse A', 'Store B', v1, d1, 1000, 50, 'Draft', null, null);
  insertTrip.run('Factory C', 'Port D', v2, d3, 14000, 300, 'Dispatched', new Date().toISOString(), null);
  insertTrip.run('Port D', 'Warehouse A', v1, d1, 500, 150, 'Completed', '2026-07-10T08:00:00Z', '2026-07-10T12:00:00Z');

  // Insert Maintenance
  const insertMaintenance = db.prepare('INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, status) VALUES (?, ?, ?, ?, ?)');
  insertMaintenance.run(v3, 'Engine Tune-up', 450, '2026-07-11', 'In Progress');
  insertMaintenance.run(v1, 'Oil Change', 80, '2026-06-15', 'Completed');

  // Insert Fuel
  const insertFuel = db.prepare('INSERT INTO fuel_logs (vehicle_id, liters, cost, date, odometer_at_fill) VALUES (?, ?, ?, ?, ?)');
  insertFuel.run(v1, 50, 75, '2026-07-01', 11000);
  insertFuel.run(v2, 200, 300, '2026-07-05', 44500);

  // Insert Expense
  const insertExpense = db.prepare('INSERT INTO expenses (category, description, cost, date, related_vehicle_id) VALUES (?, ?, ?, ?, ?)');
  insertExpense.run('Toll', 'Highway 5 toll', 15, '2026-07-06', v2);
  insertExpense.run('Software', 'Fleet Management Sub', 200, '2026-07-01', null);

  console.log('Database seeded successfully.');
};

seedData();
