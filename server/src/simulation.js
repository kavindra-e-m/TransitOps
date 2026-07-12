const startSimulation = (db) => {
  console.log('Starting vehicle location simulation...');
  
  setInterval(() => {
    try {
      // Find all vehicles currently 'On Trip'
      const onTripVehicles = db.prepare("SELECT id, latitude, longitude FROM vehicles WHERE status = 'On Trip'").all();
      const updateStmt = db.prepare('UPDATE vehicles SET latitude = ?, longitude = ? WHERE id = ?');
      
      onTripVehicles.forEach(v => {
        if (v.latitude !== null && v.longitude !== null) {
          // Simulate slight movement
          const newLat = v.latitude + (Math.random() - 0.5) * 0.002;
          const newLng = v.longitude + (Math.random() - 0.5) * 0.002;
          updateStmt.run(newLat, newLng, v.id);
        }
      });
    } catch (err) {
      console.error('Simulation error:', err.message);
    }
  }, 5000);
};

module.exports = startSimulation;
