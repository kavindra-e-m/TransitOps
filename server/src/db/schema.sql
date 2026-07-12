CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst')),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity REAL NOT NULL,
    odometer REAL NOT NULL DEFAULT 0,
    acquisition_cost REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg_no ON vehicles(reg_no);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    license_no TEXT UNIQUE NOT NULL,
    license_category TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    contact TEXT,
    trip_completion_pct REAL DEFAULT 100,
    safety_score REAL DEFAULT 100,
    status TEXT NOT NULL CHECK(status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_license_no ON drivers(license_no);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    cargo_weight REAL NOT NULL,
    planned_distance REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
    dispatched_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY(driver_id) REFERENCES drivers(id)
);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    cost REAL NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Scheduled', 'In Progress', 'Completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    liters REAL NOT NULL,
    cost REAL NOT NULL,
    date DATE NOT NULL,
    odometer_at_fill REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT,
    cost REAL NOT NULL,
    date DATE NOT NULL,
    related_vehicle_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(related_vehicle_id) REFERENCES vehicles(id)
);
