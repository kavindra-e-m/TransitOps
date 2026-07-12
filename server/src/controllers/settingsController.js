let settings = {
  depotName: 'Central Depot',
  currency: 'USD',
  distanceUnit: 'km'
};

exports.getSettings = (req, res) => {
  res.json(settings);
};

exports.updateSettings = (req, res) => {
  const { depotName, currency, distanceUnit } = req.body;
  if (depotName) settings.depotName = depotName;
  if (currency) settings.currency = currency;
  if (distanceUnit) settings.distanceUnit = distanceUnit;
  res.json(settings);
};
