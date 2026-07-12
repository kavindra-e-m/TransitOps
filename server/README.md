# TransitOps Backend API

## Base URL
`http://localhost:5000/api`

## Authentication
- **POST `/auth/signup`**
  - Body: `{ name, email, password, role }`
  - Returns: `{ id, name, email, role }`
- **POST `/auth/login`**
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

## Vehicles
- **GET `/vehicles`** (supports query filters: type, status, region)
- **GET `/vehicles/check-reg/:regNo`** -> `{ isUnique: true/false }`
- **POST `/vehicles`**
  - Body: `{ reg_no, name, type, capacity, odometer, acquisition_cost }`
- **PUT `/vehicles/:id`**
- **GET `/vehicles/:id/history`**

## Drivers
- **GET `/drivers`**
- **POST `/drivers`**
  - Body: `{ name, license_no, license_category, license_expiry, contact }`
- **PUT `/drivers/:id`**
- **PATCH `/drivers/:id/status`**
  - Body: `{ status: 'Available' | 'On Trip' | 'Suspended' }`

## Trips
- **GET `/trips`**
- **GET `/trips/available-vehicles`**
- **GET `/trips/available-drivers`**
- **POST `/trips`** (Draft status)
  - Body: `{ source, destination, vehicle_id, driver_id, cargo_weight, planned_distance }`
- **PATCH `/trips/:id/dispatch`**
- **PATCH `/trips/:id/complete`**
- **PATCH `/trips/:id/cancel`**

## Maintenance
- **GET `/maintenance`**
- **POST `/maintenance`**
  - Body: `{ vehicle_id, service_type, cost, date }`

## Cost & Analytics
- **GET `/expenses/operational-cost`**
- **GET `/analytics/summary`**
- **GET `/analytics/monthly-revenue`**
- **GET `/analytics/top-costliest-vehicles`**

## Settings & RBAC
- **GET/PUT `/settings`**
- **GET `/rbac/rbac-matrix`**
