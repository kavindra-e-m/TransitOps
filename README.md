# TransitOps — Fleet & Logistics Management System

A full-stack fleet and logistics management platform built with React, Vite, Tailwind CSS, and Express. TransitOps enables fleet managers, dispatchers, safety officers, and financial analysts to manage vehicles, drivers, trips, maintenance, fuel expenses, and analytics from a single dark-themed dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State Management | React Context API (AuthContext, AppContext) |
| Charts | Recharts |
| Maps | React Leaflet (OpenStreetMap) |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT, bcrypt |
| Dev Tools | Nodemon, Concurrently |

---

## Project Structure

```
transitops/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios API clients (one per resource)
│   │   ├── components/
│   │   │   ├── common/            # Button, Input, Modal, DataTable, KPICard, StatusBadge, Timeline
│   │   │   ├── layout/            # Sidebar, Topbar, PageWrapper, ProtectedRoute
│   │   │   └── analytics/         # AnalyticsKPICard, FleetUtilizationChart, FuelCostChart, VehicleStatusChart, ExportReportButton
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state — user, role, token, login, signup, logout
│   │   │   └── AppContext.jsx     # Global data state — vehicles, drivers, trips, maintenance, expenses
│   │   ├── hooks/
│   │   │   └── usePermission.js   # RBAC permission hook
│   │   ├── pages/                 # Login, Dashboard, Fleet, Drivers, Trips, Maintenance, FuelExpenses, Analytics, FleetMap, Settings
│   │   └── utils/                 # exportCSV.js, insights.js, validators.js
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                        # Express backend
│   ├── src/
│   │   ├── controllers/           # authController, vehicleController, driverController, tripController, maintenanceController, fuelController, expenseController, analyticsController, settingsController, rbacController
│   │   ├── routes/                # One route file per resource
│   │   ├── middleware/            # auth.js (JWT verify), rbac.js (role guards), validate.js
│   │   └── db/
│   │       ├── connection.js      # SQLite connection
│   │       ├── schema.sql         # Table definitions
│   │       ├── seed.js            # Seed data
│   │       └── transitops.db      # SQLite database file
│   ├── rbacConfig.json            # Role-permission matrix config
│   └── package.json
├── docs/
│   └── api-spec.md
├── package.json                   # Root — runs both client and server via concurrently
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation & Running

```bash
# Clone the repo
git clone https://github.com/kavindra-e-m/TransitOps.git
cd TransitOps

# Install all dependencies (root + client + server)
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Run both frontend and backend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## Environment

The server uses `process.env.JWT_SECRET` for signing tokens. It defaults to `supersecret` if not set. For production, create a `.env` file in `server/`:

```
JWT_SECRET=your_secret_here
PORT=5000
```

---

## Features

### Authentication
- Sign Up with name, email, password, and role selection
- Sign In with JWT-based authentication
- Role-based access control (RBAC) — Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
- Account lockout after 5 failed login attempts (15-minute lock)
- `usePermission` hook for per-page, per-role access guards

### Dashboard
- 8 live KPI cards — Fleet Utilization %, Active Vehicles, Available Vehicles, In Maintenance, Active Trips, Pending Trips, Drivers On Duty, On-Time Performance %
- Fleet filter bar — filter KPIs by Vehicle Type, Status, and Region (North/South) in real-time
- GPS cluster map widget with animated pulse markers showing truck/van distribution and delay clusters
- Active Shipments table — live dispatched trips with route, cargo weight, and distance
- Credentials Risk panel — flags drivers with expired or soon-to-expire licenses, click-through to Drivers page
- Vehicles Pending Service panel — mileage progress bars flagging overdue/due-soon vehicles, click-through to Maintenance
- Recent Alerts panel — mechanical failure, route deviation, and weather warning alerts with action buttons
- Dispatcher Performance metrics — alert response time and optimization efficiency progress bars
- Live Telemetry badge — shows WebSocket connection status (Live / Reconnecting)
- Auto-refreshes every 20 seconds

### Fleet Management
- Full vehicle registry with search, type, and status filters
- Add new vehicles with real-time registration number uniqueness check
- Click any vehicle to view trip history and maintenance history in a slide-in drawer
- KPI cards for total, available, on-trip, and in-maintenance counts

### Fleet Map
- Interactive Leaflet map (OpenStreetMap) showing real-time vehicle locations
- Color-coded markers — green (Available), blue (On Trip), red (In Shop / other)
- Popup on each marker showing vehicle name, registration, driver, status, and capacity
- Auto-refreshes every 5 seconds via polling

### Driver Management
- Driver roster with license expiry validation
- Animated safety score circular progress rings (green/orange/red)
- Bulk status updates — Available, Off Duty, Suspend
- Expired license guard — prevents setting expired drivers to Available

### Trip Dispatcher
- Dispatch form with live cargo overload validation against vehicle max capacity
- Only available vehicles and non-expired drivers shown in dropdowns
- Horizontal status stepper tracking Draft → Dispatched → Completed/Cancelled
- Live dispatch board — complete or cancel trips directly from cards
- Cascading status updates — vehicle and driver statuses update automatically

### Maintenance Log
- Log service records with vehicle, service type, cost, date
- Active records set vehicle to In Shop automatically
- Close records to return vehicle to Available
- Animated SVG state-flow diagram showing Available ↔ In Shop transitions
- KPI cards for active logs, total spend, vehicles in shop

### Fuel & Expenses
- Separate fuel refill logs and other expense logs (toll, repair, other)
- Per-vehicle filter
- Total operational cost banner with live calculation
- KPI cards for fuel spend, toll spend, repair spend

### Analytics
- 4 KPI cards — Fuel Efficiency (L/100km), Fleet Utilization %, Operational Cost (₹), Vehicle ROI %
- Monthly Operational Spend bar chart (Recharts)
- Top Costliest Vehicles horizontal bar chart with animated progress bars
- Vehicle Status breakdown chart
- Fleet Utilization radial/gauge chart
- Fuel Cost trend chart
- Fuel Purchase Auditing & Anomalies — flags suspicious refuels with reasons, anomaly rate stats
- CSV export for reports (Fleet Manager / Financial Analyst only)
- Access restricted for roles without `view_analytics` permission (403 guard)

### Settings
- View and update system settings
- RBAC matrix viewer — shows all role-permission mappings from `rbacConfig.json`

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, returns JWT |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vehicles` | List all vehicles (filter: type, status) |
| POST | `/vehicles` | Add new vehicle |
| PUT | `/vehicles/:id` | Update vehicle |
| GET | `/vehicles/:id/history` | Vehicle trip + maintenance history |
| GET | `/vehicles/check-reg/:regNo` | Check registration uniqueness |
| GET | `/vehicles/locations` | All vehicle GPS coordinates for Fleet Map |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/drivers` | List all drivers |
| POST | `/drivers` | Add new driver |
| PUT | `/drivers/:id` | Update driver |
| PATCH | `/drivers/:id/status` | Update driver status |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips` | List all trips |
| POST | `/trips` | Create draft trip |
| PATCH | `/trips/:id/dispatch` | Dispatch trip |
| PATCH | `/trips/:id/complete` | Complete trip |
| PATCH | `/trips/:id/cancel` | Cancel trip |
| GET | `/trips/available-vehicles` | Available vehicles for dispatch |
| GET | `/trips/available-drivers` | Available drivers for dispatch |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/maintenance` | List all records |
| POST | `/maintenance` | Log new service record |

### Fuel & Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses/operational-cost` | Total operational cost |
| GET | `/fuel` | Fuel logs |
| POST | `/fuel` | Log fuel refill |
| POST | `/expenses` | Log expense |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/summary` | Fleet summary KPIs (utilization, fuel efficiency, operational cost, ROI) |
| GET | `/analytics/monthly-revenue` | Monthly operational spend data |
| GET | `/analytics/top-costliest-vehicles` | Top costliest vehicles by total spend |

### Settings & RBAC
| Method | Endpoint | Description |
|---|---|---|
| GET | `/settings` | Get settings |
| PUT | `/settings` | Update settings |
| GET | `/rbac/rbac-matrix` | Get RBAC matrix |

---

## Branch Strategy

| Branch | Owner | Purpose |
|---|---|---|
| `main` | All | Production-ready merged code |
| `dev` | All | Integration branch — PRs merge here first |
| `feature/frontend-core` | Member 2 | App shell, auth, dashboard, layout |
| `feature/frontend-modules` | Member 3 | Fleet, Drivers, Trips, Maintenance, Fuel pages + shared components |
| `feature/backend-api` | Member 1 | Express API, database schema, controllers, routes |
| `feature/integration-analytics` | Member 4 | Analytics, Settings, integration testing |

---

## Design System

| Token | Value |
|---|---|
| Background Primary | `#0B0E14` |
| Background Sidebar | `#0D1117` |
| Background Card | `#131826` |
| Accent | `#F59E0B` |
| Text Primary | `#F9FAFB` |
| Text Secondary | `#9CA3AF` |
| Status Available | `#22C55E` |
| Status On Trip | `#3B82F6` |
| Status In Shop | `#F97316` |
| Status Retired | `#EF4444` |

Fonts: **Inter** (UI), **JetBrains Mono** (KPI numbers, monospace values)
