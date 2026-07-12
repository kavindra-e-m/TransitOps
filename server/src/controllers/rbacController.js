const fs = require('fs');
const path = require('path');

exports.getRbacMatrix = (req, res) => {
  try {
    const configPath = path.resolve(__dirname, '../../rbacConfig.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      res.json(config);
    } else {
      // Default fallback
      const defaultConfig = {
        "Fleet Manager": ["manage_vehicles", "manage_drivers", "manage_settings", "dispatch_trips", "manage_maintenance", "view_analytics", "manage_expenses"],
        "Dispatcher": ["dispatch_trips", "view_vehicles", "view_drivers"],
        "Safety Officer": ["manage_maintenance", "view_drivers", "view_vehicles"],
        "Financial Analyst": ["view_analytics", "manage_expenses", "view_vehicles"]
      };
      res.json(defaultConfig);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read RBAC matrix.' });
  }
};
