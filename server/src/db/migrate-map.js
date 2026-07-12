const db = require('./connection');

const migrate = () => {
  // Check if latitude column exists
  const tableInfo = db.pragma('table_info(vehicles)');
  const hasLatitude = tableInfo.some(col => col.name === 'latitude');
  
  if (!hasLatitude) {
    console.log('Adding latitude and longitude columns to vehicles table...');
    db.prepare('ALTER TABLE vehicles ADD COLUMN latitude REAL').run();
    db.prepare('ALTER TABLE vehicles ADD COLUMN longitude REAL').run();
  }

  // Seed coordinates for all vehicles if missing
  const vehicles = db.prepare('SELECT id, latitude FROM vehicles').all();
  const updateStmt = db.prepare('UPDATE vehicles SET latitude = ?, longitude = ? WHERE id = ?');
  
  let updatedCount = 0;
  // Chennai center ~ 13.0827, 80.2707
  vehicles.forEach(v => {
    if (v.latitude === null || v.latitude === undefined) {
      // Add some random offset for variety
      const lat = 13.0827 + (Math.random() - 0.5) * 0.1;
      const lng = 80.2707 + (Math.random() - 0.5) * 0.1;
      updateStmt.run(lat, lng, v.id);
      updatedCount++;
    }
  });
  
  console.log(`Migration complete. Updated ${updatedCount} vehicles with initial coordinates.`);
};

migrate();
