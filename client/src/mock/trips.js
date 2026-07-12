export const initialTrips = [
  {
    id: "T001",
    source: "Houston Logistics Center, TX",
    destination: "Dallas Distribution Hub, TX",
    vehicleId: "V002",
    driverId: "D002",
    cargoWeight: 18500, // kg
    plannedDistance: 240, // miles/km
    status: "Dispatched",
    createdAt: "2026-07-11T08:30:00Z"
  },
  {
    id: "T002",
    source: "Chicago Warehouse #4, IL",
    destination: "Milwaukee Fulfillment, WI",
    vehicleId: "V006",
    driverId: "D006",
    cargoWeight: 950,
    plannedDistance: 95,
    status: "Dispatched",
    createdAt: "2026-07-11T09:15:00Z"
  },
  {
    id: "T003",
    source: "Atlanta Sorting Facility, GA",
    destination: "Savannah Port Terminal, GA",
    vehicleId: "V005", // Max capacity is 1500kg
    driverId: "D001",
    cargoWeight: 2800, // Exceeds capacity (2800 > 1500)
    plannedDistance: 250,
    status: "Draft",
    createdAt: "2026-07-12T06:00:00Z"
  },
  {
    id: "T004",
    source: "Denver Depot, CO",
    destination: "Salt Lake City Warehouse, UT",
    vehicleId: "V001",
    driverId: "D003",
    cargoWeight: 22000,
    plannedDistance: 520,
    status: "Completed",
    createdAt: "2026-07-09T14:20:00Z"
  },
  {
    id: "T005",
    source: "Phoenix Terminal, AZ",
    destination: "Los Angeles Port, CA",
    vehicleId: "V004",
    driverId: "D009",
    cargoWeight: 6800,
    plannedDistance: 370,
    status: "Completed",
    createdAt: "2026-07-10T11:00:00Z"
  },
  {
    id: "T006",
    source: "Boston Central Depot, MA",
    destination: "New York Hub, NY",
    vehicleId: "V002",
    driverId: "D002",
    cargoWeight: 15000,
    plannedDistance: 215,
    status: "Completed",
    createdAt: "2026-07-08T07:45:00Z"
  },
  {
    id: "T007",
    source: "Seattle Logistics, WA",
    destination: "Portland Depot, OR",
    vehicleId: "V004",
    driverId: "D009",
    cargoWeight: 5000,
    plannedDistance: 175,
    status: "Cancelled",
    createdAt: "2026-07-10T15:30:00Z"
  },
  {
    id: "T008",
    source: "Kansas City Warehouse, MO",
    destination: "St. Louis Hub, MO",
    vehicleId: "V009",
    driverId: "D010",
    cargoWeight: 3500,
    plannedDistance: 250,
    status: "Draft",
    createdAt: "2026-07-12T08:00:00Z"
  },
  {
    id: "T009",
    source: "Miami Port, FL",
    destination: "Orlando Fulfillment, FL",
    vehicleId: "V010",
    driverId: "D001",
    cargoWeight: 1100,
    plannedDistance: 235,
    status: "Draft",
    createdAt: "2026-07-12T09:45:00Z"
  }
];
