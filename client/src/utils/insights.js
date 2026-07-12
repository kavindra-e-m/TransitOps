/**
 * insights.js — TransitOps Innovation Feature Utilities
 *
 * Pure functions for all 7 enhancement features.
 * No side-effects, no imports from React/context.
 * All functions take plain data arrays and return plain values.
 */

// ─── Feature 5 Constants ─────────────────────────────────────────────────────
/** Km threshold before a "Service Due" warning is triggered */
export const SERVICE_KM_THRESHOLD = 5000;

// ─── Feature 6 Constants ─────────────────────────────────────────────────────
/** Assumed vehicle lifespan in km for health % calculation */
export const VEHICLE_LIFESPAN_KM = 300_000;
/** Revenue per km assumption (reused from Analytics ROI logic) */
export const REVENUE_PER_KM = 4.5; // $4.50/km

// ─── Feature 7 Constants ─────────────────────────────────────────────────────
/** Fleet-wide default fuel efficiency (km/L) when no history is available */
export const DEFAULT_FUEL_EFFICIENCY_KM_PER_L = 8;
/** Anomaly threshold: flag if actual > expected * this multiplier */
export const FUEL_ANOMALY_MULTIPLIER = 1.3;


// ─── Feature 1: Trip Timeline ─────────────────────────────────────────────────

/**
 * Returns the list of timeline stages for a trip, each with completion state.
 *
 * @param {{ status: string }} trip
 * @returns {{ label: string, state: 'completed'|'active'|'future'|'cancelled' }[]}
 */
export function getTripTimelineStages(trip) {
  const STAGES = [
    'Trip Created',
    'Driver Assigned',
    'Vehicle Assigned',
    'Dispatched',
    'Reached Destination',
    'Completed',
  ];

  // Map trip status → how many stages are "completed"
  const STATUS_PROGRESS = {
    Draft: 1,
    Dispatched: 4,
    Completed: 6,
    Cancelled: 4, // same as Dispatched — cancelled at dispatch stage
  };

  const completedCount = STATUS_PROGRESS[trip.status] ?? 1;
  const isCancelled = trip.status === 'Cancelled';

  return STAGES.map((label, i) => {
    const stageNum = i + 1;
    if (isCancelled && stageNum === completedCount) {
      return { label, state: 'cancelled' };
    }
    if (stageNum < completedCount) return { label, state: 'completed' };
    if (stageNum === completedCount && !isCancelled) return { label, state: 'active' };
    return { label, state: 'future' };
  });
}


// ─── Feature 2: Safety Score Leaderboard ─────────────────────────────────────

/**
 * Returns drivers sorted by safetyScore descending, with rank attached.
 *
 * @param {Array} drivers
 * @returns {Array} sorted drivers with `.rank` field
 */
export function calculateSafetyRank(drivers) {
  return [...drivers]
    .sort((a, b) => b.safetyScore - a.safetyScore)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}


// ─── Feature 3: License Expiry Tiered Alerts ─────────────────────────────────

/**
 * Returns the expiry tier and days remaining for a license expiry date string.
 *
 * @param {string} expiryDateStr — ISO date string e.g. "2026-08-15"
 * @param {Date} [today] — override for testing; defaults to new Date()
 * @returns {{ tier: 'ok'|'warn'|'critical'|'expired', daysLeft: number }}
 */
export function getLicenseExpiryTier(expiryDateStr, today = new Date()) {
  const expiry = new Date(expiryDateStr);
  const todayNoon = new Date(today);
  todayNoon.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((expiry - todayNoon) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { tier: 'expired', daysLeft };
  if (daysLeft <= 7) return { tier: 'critical', daysLeft };
  if (daysLeft <= 30) return { tier: 'warn', daysLeft };
  return { tier: 'ok', daysLeft };
}

/**
 * Returns drivers whose license is critical (0-7 days) or expired.
 * Used by the Dashboard License Alerts widget.
 *
 * @param {Array} drivers
 * @returns {Array} filtered drivers with `.expiryInfo` attached
 */
export function getLicenseAlertDrivers(drivers) {
  return drivers
    .map(d => ({ ...d, expiryInfo: getLicenseExpiryTier(d.licenseExpiryDate) }))
    .filter(d => d.expiryInfo.tier === 'critical' || d.expiryInfo.tier === 'expired');
}


// ─── Feature 4: Smart Dispatch Recommendation ────────────────────────────────

/**
 * Min-max normalize an array of numbers to [0, 1] range.
 * Returns 0.5 for all values if the range is zero (all identical).
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function minMaxNormalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map(v => (v - min) / (max - min));
}

/**
 * Score and rank available vehicles for a given cargo weight.
 * Only considers vehicles with status === 'Available' and capacity >= cargoWeight.
 *
 * Score = (1 - normalizedMaintenanceCost)*0.4 + (1 - normalizedOdometer)*0.3 + normalizedFuelEff*0.3
 *
 * @param {Array} vehicles
 * @param {Array} maintenanceRecords  — from useMaintenance()
 * @param {Array} expenses            — from useExpenses() (combined fuel+other)
 * @param {Array} trips               — from useTrips()
 * @param {number} cargoWeight
 * @returns {{ vehicle: object, score: number, reason: string }[]} sorted best-first
 */
export function scoreVehicles(vehicles, maintenanceRecords, expenses, trips, cargoWeight) {
  const eligible = vehicles.filter(
    v => v.status === 'Available' && v.maxLoadCapacity >= cargoWeight
  );
  if (eligible.length === 0) return [];

  // Compute total maintenance cost per vehicle
  const maintCostMap = {};
  maintenanceRecords.forEach(m => {
    maintCostMap[m.vehicleId] = (maintCostMap[m.vehicleId] || 0) + m.cost;
  });

  // Compute average fuel efficiency per vehicle from completed trips + fuel logs
  const fuelEffMap = {};
  const completedTrips = trips.filter(t => t.status === 'Completed');
  completedTrips.forEach(trip => {
    const vid = trip.vehicleId;
    const fuelLogs = expenses.filter(e => e.type === 'fuel' && e.vehicleId === vid);
    const totalLiters = fuelLogs.reduce((s, f) => s + (f.liters || 0), 0);
    const totalDist = trip.plannedDistance;
    if (totalLiters > 0 && totalDist > 0) {
      if (!fuelEffMap[vid]) fuelEffMap[vid] = [];
      fuelEffMap[vid].push(totalDist / totalLiters);
    }
  });

  const rawMaintCosts = eligible.map(v => maintCostMap[v.id] || 0);
  const rawOdometers  = eligible.map(v => v.odometer);
  const rawFuelEffs   = eligible.map(v => {
    const effs = fuelEffMap[v.id];
    return effs ? effs.reduce((a, b) => a + b, 0) / effs.length : DEFAULT_FUEL_EFFICIENCY_KM_PER_L;
  });

  const normMaint   = minMaxNormalize(rawMaintCosts);
  const normOdo     = minMaxNormalize(rawOdometers);
  const normFuelEff = minMaxNormalize(rawFuelEffs);

  const scored = eligible.map((v, i) => {
    const score =
      (1 - normMaint[i]) * 0.4 +
      (1 - normOdo[i])   * 0.3 +
      normFuelEff[i]     * 0.3;

    const reason = `Lowest maintenance cost ratio | ${v.odometer.toLocaleString()} km odometer | ${rawFuelEffs[i].toFixed(1)} km/L efficiency`;
    return { vehicle: v, score, reason };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Score and rank available drivers.
 * Only considers drivers with status === 'Available' and non-expired license.
 *
 * Score = normalizedSafetyScore*0.7 + normalizedCompletionPct*0.3
 *
 * @param {Array} drivers
 * @param {Date} [today]
 * @returns {{ driver: object, score: number, reason: string }[]} sorted best-first
 */
export function scoreDrivers(drivers, today = new Date()) {
  const eligible = drivers.filter(d => {
    if (d.status !== 'Available') return false;
    const { tier } = getLicenseExpiryTier(d.licenseExpiryDate, today);
    return tier !== 'expired';
  });
  if (eligible.length === 0) return [];

  const rawSafety     = eligible.map(d => d.safetyScore);
  const rawCompletion = eligible.map(d => d.tripCompletionPct ?? 100);

  const normSafety     = minMaxNormalize(rawSafety);
  const normCompletion = minMaxNormalize(rawCompletion);

  const scored = eligible.map((d, i) => {
    const score = normSafety[i] * 0.7 + normCompletion[i] * 0.3;
    const reason = `Safety score ${d.safetyScore}% | ${d.tripCompletionPct ?? 100}% trip completion`;
    return { driver: d, score, reason };
  });

  return scored.sort((a, b) => b.score - a.score);
}


// ─── Feature 5: Predictive Maintenance Flag ───────────────────────────────────

/**
 * Returns the predictive maintenance status for a vehicle.
 *
 * Since maintenance records don't carry odometer-at-service, we use:
 *   kmSinceLastService = vehicle.odometer - acquisitionOdometer (always 0 at registration)
 * This gives "km since acquisition" — a safe conservative proxy.
 * If there IS a maintenance record, we use vehicle.odometer as a rough indicator.
 *
 * @param {object} vehicle
 * @param {Array}  maintenanceRecords — all records (will filter by vehicleId)
 * @returns {{ status: 'ok'|'warning'|'overdue', kmSince: number, lastServiceDate: string|null }}
 */
export function getPredictiveMaintenance(vehicle, maintenanceRecords) {
  const vehicleRecords = maintenanceRecords
    .filter(m => m.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const lastServiceDate = vehicleRecords[0]?.date || null;

  // Use odometer as a proxy for km since last service (simplified)
  // In production this would be: lastService.odometerAtService subtracted from current
  const kmSince = vehicle.odometer;

  let status = 'ok';
  if (kmSince > SERVICE_KM_THRESHOLD * 1.5) status = 'overdue';
  else if (kmSince > SERVICE_KM_THRESHOLD) status = 'warning';

  return { status, kmSince, lastServiceDate };
}

/**
 * Returns vehicles that need predictive maintenance attention.
 * Used by the Dashboard Predictive Maintenance widget.
 *
 * @param {Array} vehicles
 * @param {Array} maintenanceRecords
 * @returns {Array} vehicles with `.maintenanceFlag` attached, filtered to warning/overdue only
 */
export function getMaintenanceAlertVehicles(vehicles, maintenanceRecords) {
  return vehicles
    .map(v => ({ ...v, maintenanceFlag: getPredictiveMaintenance(v, maintenanceRecords) }))
    .filter(v => v.maintenanceFlag.status !== 'ok');
}


// ─── Feature 6: Vehicle Health Card ──────────────────────────────────────────

/**
 * Computes a composite vehicle health percentage (0-100).
 *
 * Scoring:
 *   - Start at 100
 *   - -25 if maintenance is overdue
 *   - -10 if maintenance is warning
 *   - -15 if operationalCost/acquisitionCost > 0.5 (high cost ratio)
 *   - -20 if odometer > 200,000 km (high mileage)
 *   - Clamp to [0, 100]
 *
 * @param {object} vehicle
 * @param {'ok'|'warning'|'overdue'} maintStatus
 * @param {Array}  vehicleExpenses — already filtered to this vehicle's expenses
 * @returns {{ healthPct: number, lifetimeCost: number, profit: number, fuelEfficiency: number|null }}
 */
export function calculateVehicleHealth(vehicle, maintStatus, vehicleExpenses, vehicleTrips) {
  let health = 100;

  if (maintStatus === 'overdue') health -= 25;
  else if (maintStatus === 'warning') health -= 10;

  const lifetimeCost = vehicleExpenses.reduce((s, e) => s + e.cost, 0);
  const costRatio = vehicle.acquisitionCost > 0 ? lifetimeCost / vehicle.acquisitionCost : 0;
  if (costRatio > 0.5) health -= 15;

  if (vehicle.odometer > 200_000) health -= 20;

  health = Math.max(0, Math.min(100, health));

  // Profit: revenue from completed trips - lifetime cost
  const completedTrips = vehicleTrips.filter(t => t.status === 'Completed');
  const revenue = completedTrips.reduce((s, t) => s + t.plannedDistance * REVENUE_PER_KM, 0);
  const profit = revenue - lifetimeCost;

  // Fuel efficiency: km/L from completed trips + fuel log data
  const fuelLogs = vehicleExpenses.filter(e => e.type === 'fuel');
  const totalLiters = fuelLogs.reduce((s, f) => s + (f.liters || 0), 0);
  const totalDistance = completedTrips.reduce((s, t) => s + t.plannedDistance, 0);
  const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : null;

  return { healthPct: health, lifetimeCost, profit, fuelEfficiency };
}


// ─── Feature 7: Fuel Anomaly Detection ───────────────────────────────────────

/**
 * Computes the average fuel efficiency (km/L) for a specific vehicle
 * from its completed trips and associated fuel log records.
 * Falls back to DEFAULT_FUEL_EFFICIENCY_KM_PER_L if insufficient data.
 *
 * @param {number} vehicleId
 * @param {Array}  trips     — all trips
 * @param {Array}  expenses  — all combined expenses (type: 'fuel' entries used)
 * @returns {number} km/L
 */
export function getVehicleAvgEfficiency(vehicleId, trips, expenses) {
  const completedTrips = trips.filter(
    t => t.vehicleId === vehicleId && t.status === 'Completed'
  );
  const fuelLogs = expenses.filter(
    e => e.type === 'fuel' && e.vehicleId === vehicleId
  );

  const totalDistance = completedTrips.reduce((s, t) => s + t.plannedDistance, 0);
  const totalLiters = fuelLogs.reduce((s, f) => s + (f.liters || 0), 0);

  if (totalLiters > 0 && totalDistance > 0) {
    return totalDistance / totalLiters;
  }
  return DEFAULT_FUEL_EFFICIENCY_KM_PER_L;
}

/**
 * For each fuel log entry, compute whether it's anomalous.
 * Returns the same array with `.anomaly` info appended.
 *
 * @param {Array} fuelLogs      — entries where type === 'fuel'
 * @param {Array} allExpenses   — full expenses array
 * @param {Array} trips
 * @returns {Array} fuel logs with `.anomaly: { flagged, expectedLiters, actualLiters }` attached
 */
export function detectFuelAnomalies(fuelLogs, allExpenses, trips) {
  // Build per-vehicle efficiency map
  const vehicleIds = [...new Set(fuelLogs.map(f => f.vehicleId))];
  const efficiencyMap = {};
  vehicleIds.forEach(vid => {
    efficiencyMap[vid] = getVehicleAvgEfficiency(vid, trips, allExpenses);
  });

  // Sort fuel logs by vehicleId + date to compute distance-since-last-fill
  const sorted = [...fuelLogs].sort((a, b) => {
    if (a.vehicleId !== b.vehicleId) return a.vehicleId - b.vehicleId;
    return new Date(a.date) - new Date(b.date);
  });

  // Index by original position to attach anomaly info back
  return fuelLogs.map(log => {
    // Find the previous fuel log for this vehicle
    const vehicleLogs = sorted.filter(f => f.vehicleId === log.vehicleId);
    const idx = vehicleLogs.findIndex(f => f.id === log.id);
    const prev = idx > 0 ? vehicleLogs[idx - 1] : null;

    // Estimate distance since last fill using completed trips in that period
    let distanceSinceLastFill = 0;
    if (prev) {
      const tripsBetween = trips.filter(t => {
        if (t.vehicleId !== log.vehicleId) return false;
        if (t.status !== 'Completed') return false;
        const tripDate = new Date(t.createdAt || t.date);
        return tripDate >= new Date(prev.date) && tripDate <= new Date(log.date);
      });
      distanceSinceLastFill = tripsBetween.reduce((s, t) => s + t.plannedDistance, 0);
    }

    const avgEff = efficiencyMap[log.vehicleId] || DEFAULT_FUEL_EFFICIENCY_KM_PER_L;
    const expectedLiters = distanceSinceLastFill > 0
      ? distanceSinceLastFill / avgEff
      : null; // no distance data → can't flag

    const actualLiters = log.liters || 0;
    const flagged = expectedLiters !== null && actualLiters > expectedLiters * FUEL_ANOMALY_MULTIPLIER;

    return {
      ...log,
      anomaly: {
        flagged,
        expectedLiters: expectedLiters ? Math.round(expectedLiters * 10) / 10 : null,
        actualLiters,
        avgEfficiency: Math.round(avgEff * 10) / 10,
      }
    };
  });
}
