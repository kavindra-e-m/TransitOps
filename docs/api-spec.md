# TransitOps API Specification

All HTTP endpoints are exposed relative to the API Base URL: `http://localhost:5000/api`.

---

## 🔒 Authentication & Headers

Protected endpoints require the JWT bearer token header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 🔑 Authentication Endpoints

### 1. Register Account
* **Endpoint**: `POST /auth/signup`
* **Public Access**
* **Request Body**:
```json
{
  "name": "Alex Mercer",
  "email": "alex@transitops.com",
  "password": "password123",
  "role": "Fleet Manager"
}
```
* **Validation**:
  - `name`: Must not be empty.
  - `email`: Must be a valid email format.
  - `password`: Minimum 6 characters.
  - `role`: Must be one of `['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']`.
* **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "userId": 5
}
```

### 2. User Sign In
* **Endpoint**: `POST /auth/login`
* **Public Access**
* **Request Body**:
```json
{
  "email": "manager@transitops.com",
  "password": "password123"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "name": "Fleet Admin",
    "email": "manager@transitops.com",
    "role": "Fleet Manager"
  }
}
```

---

## 🚚 Vehicles Endpoints

### 1. List All Vehicles
* **Endpoint**: `GET /vehicles`
* **Role Access**: All logged-in users.
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "reg_no": "VAN-05",
    "name": "Ford Transit",
    "type": "Van",
    "capacity": 1500,
    "odometer": 12000,
    "acquisition_cost": 35000,
    "status": "Available",
    "latitude": null,
    "longitude": null
  }
]
```

### 2. Create Vehicle
* **Endpoint**: `POST /vehicles`
* **Role Access**: `Fleet Manager`, `Dispatcher`
* **Request Body**:
```json
{
  "reg_no": "TRK-22",
  "name": "Scania R500",
  "type": "Truck",
  "capacity": 18000,
  "acquisition_cost": 145000
}
```
* **Response (201 Created)**:
```json
{
  "message": "Vehicle created successfully",
  "id": 4
}
```

### 3. Delete Vehicle
* **Endpoint**: `DELETE /vehicles/:id`
* **Role Access**: `Fleet Manager`
* **Response (200 OK)**:
```json
{
  "message": "Vehicle deleted successfully"
}
```

---

## 🗺️ Trips & Routing Endpoints

### 1. List Trips
* **Endpoint**: `GET /trips`
* **Role Access**: All logged-in users.
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "source": "Warehouse A",
    "destination": "Store B",
    "vehicle_id": 1,
    "driver_id": 1,
    "cargo_weight": 1000,
    "planned_distance": 50,
    "status": "Draft",
    "dispatched_at": null,
    "completed_at": null
  }
]
```

### 2. Dispatch Trip
* **Endpoint**: `POST /trips`
* **Role Access**: `Fleet Manager`, `Dispatcher`
* **Request Body**:
```json
{
  "source": "Terminal Alpha",
  "destination": "Port Beta",
  "vehicle_id": 2,
  "driver_id": 3,
  "cargo_weight": 12000,
  "planned_distance": 180
}
```
* **Response (201 Created)**:
```json
{
  "message": "Trip created successfully",
  "id": 4
}
```

### 3. Update Trip Status
* **Endpoint**: `PUT /trips/:id`
* **Role Access**: `Fleet Manager`, `Dispatcher`
* **Request Body**:
```json
{
  "status": "Dispatched"
}
```
* **Response (200 OK)**:
```json
{
  "message": "Trip updated successfully"
}
```
