-- Campus Rides Database Schema Initialization

-- 1. Base Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('DRIVER', 'PASSENGER', 'ADMIN') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    profile_picture_url VARCHAR(255) DEFAULT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Derived Drivers Table (Joined Inheritance)
CREATE TABLE IF NOT EXISTS drivers (
    user_id INT PRIMARY KEY,
    license_number VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    cnic_number VARCHAR(20) DEFAULT NULL,
    cnic_front_url VARCHAR(255) DEFAULT NULL,
    cnic_back_url VARCHAR(255) DEFAULT NULL,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Derived Passengers Table (Joined Inheritance)
CREATE TABLE IF NOT EXISTS passengers (
    user_id INT PRIMARY KEY,
    wallet_balance DOUBLE DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3.5. Passenger Ride Requests Table
CREATE TABLE IF NOT EXISTS passenger_ride_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    destination_location VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    seats_needed INT NOT NULL,
    fare_offered DOUBLE NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Rides Table
CREATE TABLE IF NOT EXISTS rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    destination_location VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_fare DOUBLE NOT NULL,
    status ENUM('CREATED', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'CREATED',
    FOREIGN KEY (driver_id) REFERENCES drivers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seats_booked INT NOT NULL,
    fare_paid DOUBLE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    otp_code VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    passenger_id INT NOT NULL,
    driver_id INT NOT NULL,
    score INT NOT NULL,
    comment TEXT,
    is_driver_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    amount DOUBLE NOT NULL,
    type ENUM('DEPOSIT', 'PAYMENT', 'REFUND') NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    ride_id INT DEFAULT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'RESOLVED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- TEST SEED DATA (All passwords are BCrypt "password")
-- BCrypt hash: $2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy
-- ==========================================

-- Seed Admin
INSERT IGNORE INTO users (id, username, email, password, role, full_name, phone_number, created_at)
VALUES (1, 'admin', 'admin@campus.edu', '$2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy', 'ADMIN', 'System Administrator', '555-0100', NOW());

-- Seed Drivers
INSERT IGNORE INTO users (id, username, email, password, role, full_name, phone_number, created_at)
VALUES (2, 'johndoe', 'jdoe@campus.edu', '$2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy', 'DRIVER', 'John Doe', '555-0101', NOW());
INSERT IGNORE INTO drivers (user_id, license_number, is_verified)
VALUES (2, 'DL-87654321', TRUE);

INSERT IGNORE INTO users (id, username, email, password, role, full_name, phone_number, created_at)
VALUES (3, 'sarah_smith', 'ssmith@campus.edu', '$2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy', 'DRIVER', 'Sarah Smith', '555-0102', NOW());
INSERT IGNORE INTO drivers (user_id, license_number, is_verified)
VALUES (3, 'DL-12345678', TRUE);

-- Seed Passengers
INSERT IGNORE INTO users (id, username, email, password, role, full_name, phone_number, created_at)
VALUES (4, 'alex_green', 'agreen@campus.edu', '$2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy', 'PASSENGER', 'Alex Green', '555-0103', NOW());
INSERT IGNORE INTO passengers (user_id, wallet_balance)
VALUES (4, 150.00);

INSERT IGNORE INTO users (id, username, email, password, role, full_name, phone_number, created_at)
VALUES (5, 'emily_brown', 'ebrown@campus.edu', '$2a$10$8.2qPhF5sBSed8IYry5Ek.4r.H7PPJ9oaB2t2dp3a2m97A3yGByJy', 'PASSENGER', 'Emily Brown', '555-0104', NOW());
INSERT IGNORE INTO passengers (user_id, wallet_balance)
VALUES (5, 75.50);

-- Seed Vehicles
INSERT IGNORE INTO vehicles (id, driver_id, make, model, license_plate, color, capacity)
VALUES (1, 2, 'Toyota', 'Prius', 'CAMPUS-D1', 'Silver', 4);
INSERT IGNORE INTO vehicles (id, driver_id, make, model, license_plate, color, capacity)
VALUES (2, 3, 'Tesla', 'Model 3', 'CAMPUS-D2', 'Blue', 4);

-- Seed Wallet Transactions
INSERT IGNORE INTO wallet_transactions (id, passenger_id, amount, type, description, created_at)
VALUES (1, 4, 150.00, 'DEPOSIT', 'Initial Wallet Setup', NOW());
INSERT IGNORE INTO wallet_transactions (id, passenger_id, amount, type, description, created_at)
VALUES (2, 5, 75.50, 'DEPOSIT', 'Stripe Card Deposit', NOW());

-- Seed Rides
INSERT IGNORE INTO rides (id, driver_id, vehicle_id, departure_location, destination_location, departure_time, total_seats, available_seats, base_fare, status)
VALUES (1, 2, 1, 'Main Gate Circle', 'Engineering Block B', DATE_ADD(NOW(), INTERVAL 2 HOUR), 4, 3, 5.00, 'CREATED');

INSERT IGNORE INTO rides (id, driver_id, vehicle_id, departure_location, destination_location, departure_time, total_seats, available_seats, base_fare, status)
VALUES (2, 3, 2, 'North Student Housing', 'Science Center Lab', DATE_ADD(NOW(), INTERVAL 4 HOUR), 4, 4, 8.50, 'CREATED');

-- Seed Bookings
INSERT IGNORE INTO bookings (id, ride_id, passenger_id, seats_booked, fare_paid, status, created_at)
VALUES (1, 1, 4, 1, 5.00, 'CONFIRMED', NOW());

-- Seed Ratings
INSERT IGNORE INTO ratings (id, booking_id, passenger_id, driver_id, score, comment, created_at)
VALUES (1, 1, 4, 2, 5, 'Great driving! John was on time and very friendly.', NOW());

-- Seed Complaints
INSERT IGNORE INTO complaints (id, reporter_id, ride_id, title, description, status, created_at)
VALUES (1, 4, 1, 'Late Arrival', 'Driver was 10 minutes late to the pick up point.', 'PENDING', NOW());
