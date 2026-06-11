# Copilot Task: Fix All Bugs, Security Vulnerabilities, and Code Quality Issues in carpoolapp

## Project Overview

This is a full-stack campus carpool application called **Campus Rides**. The tech stack is:

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT-based stateless auth), Spring Data JPA, MariaDB/MySQL, Maven
- **Frontend:** React 18 (Vite), JavaScript (JSX), React Router v6, plain CSS
- **Database Schema:** Defined in `campus-rides/backend/src/main/resources/schema.sql`
- **Backend source root:** `campus-rides/backend/src/main/java/com/campus/rides/`
- **Frontend source root:** `campus-rides/carpool-frontend/src/`

Your job is to go through every issue listed below — in the exact order given — and fix each one completely. Do not skip any issue. Do not break existing functionality while fixing. After fixing everything, the entire app must compile, start, and run without errors.

---

## PART 1 — CRITICAL SECURITY VULNERABILITIES (Fix These First)

---

### ISSUE 1.1 — Raw MySQL Binary Data Files Committed to Repository

**Severity:** CRITICAL  
**Files to delete:**
```
mysql_db/         (entire directory, ~34 MB of InnoDB binary data)
mysql_fresh/      (entire directory, ~34 MB of InnoDB binary data)
```

**What is wrong:**  
The entire MySQL data directory has been committed to the git repository. These are raw binary database engine files (InnoDB tablespaces, buffer pool dumps, binary logs, redo logs, undo logs, etc.). They expose the raw contents of every database table to anyone who clones the repo. They are also completely non-portable — they cannot be used on another machine without matching MySQL/MariaDB versions and system UUIDs.

**What to do:**

Step 1 — Delete both directories from the filesystem:
```bash
rm -rf mysql_db/
rm -rf mysql_fresh/
```

Step 2 — Purge them from git history using BFG Repo Cleaner or git filter-branch so they are not recoverable from old commits:
```bash
# Using BFG (recommended)
bfg --delete-folders mysql_db
bfg --delete-folders mysql_fresh
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

Step 3 — Add the following entries to the root `.gitignore` (create one if it does not exist):
```gitignore
# MySQL / MariaDB data directories
mysql_db/
mysql_fresh/
*.ibd
*.ibdata
ibdata1
ib_logfile*
#ib_*
#innodb_*
binlog.*
*.index
*.err
*.pid
*.dblwr
auto.cnf
ib_buffer_pool
```

**Expected result:** Only source code, configuration files, and `schema.sql` remain in the repository. The database is recreated from `schema.sql` on startup.

---

### ISSUE 1.2 — SSL/TLS Private Keys Exposed in Public Repository

**Severity:** CRITICAL  
**Files affected:**
```
mysql_db/ca-key.pem
mysql_db/private_key.pem
mysql_fresh/ca-key.pem
mysql_fresh/private_key.pem
mysql_db/ca.pem
mysql_db/server-cert.pem
mysql_db/server-key.pem
mysql_db/client-cert.pem
mysql_db/client-key.pem
mysql_db/public_key.pem
(and equivalents in mysql_fresh/)
```

**What is wrong:**  
Private certificate authority keys and server private keys used to sign the MySQL TLS certificates are committed in plaintext. Any person who clones the repo can impersonate the database server, perform man-in-the-middle attacks, or decrypt any previously captured TLS-encrypted database traffic. These keys are permanently compromised and must be regenerated.

**What to do:**

Step 1 — All `.pem` files are removed as part of deleting `mysql_db/` and `mysql_fresh/` in Issue 1.1.

Step 2 — Add to `.gitignore`:
```gitignore
# TLS / SSL certificates and keys
*.pem
*.key
*.crt
*.p12
*.jks
*.keystore
*.truststore
```

Step 3 — If TLS is needed for the database connection, generate fresh certificates using MySQL's built-in SSL generator or OpenSSL. Store them outside the repository (e.g. in a secrets manager, environment-specific config folder that is gitignored, or Docker secrets).

Step 4 — Rotate any other credentials that may have been exposed in the same commits (database passwords, JWT secrets).

**Expected result:** No private keys, certificates, or `.pem` files exist anywhere in the repository.

---

### ISSUE 1.3 — Admin Account Can Be Self-Registered via Public Signup Endpoint

**Severity:** CRITICAL  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/AuthServiceImpl.java`  
**Method:** `signup(SignupRequest request)`

**What is wrong:**  
The `signup()` method has a conditional chain: `if DRIVER → create driver`, `else if PASSENGER → create passenger`, `else → create ADMIN user`. Because the `role` field comes directly from the request body with no server-side restriction, any anonymous HTTP client can send `{ "role": "ADMIN", ... }` and receive full administrator privileges. There is no protection at all.

**Current broken code (the else branch that must be changed):**
```java
} else {
    // Seed standard Admin (normally created by system operators)
    User user = new User(
            request.getUsername(),
            request.getEmail(),
            encodedPassword,
            UserRole.ADMIN,
            request.getFullName(),
            request.getPhoneNumber()
    );
    userRepository.save(user);
}
```

**What to do:**

Option A (Recommended — Throw an error for any unrecognized/admin role):
Replace the else branch with:
```java
} else {
    throw new RuntimeException("Invalid role specified. Only DRIVER and PASSENGER accounts can be registered via this endpoint.");
}
```

Option B (If admin seeding is genuinely needed, protect it with an internal flag):
Create a separate, secured endpoint in `AdminController.java` annotated with `@PreAuthorize("hasRole('ADMIN')")` that allows an existing admin to create another admin. The public signup endpoint must never create admins.

Also update the `SignupRequest` DTO validation so the `role` field only accepts `DRIVER` or `PASSENGER`:
```java
// In SignupRequest.java
@NotNull(message = "Role selection is required")
private UserRole role;
```
Add a custom validator or add this check at the beginning of `signup()`:
```java
if (request.getRole() == UserRole.ADMIN) {
    throw new RuntimeException("Admin accounts cannot be created via public registration.");
}
```

**Expected result:** Calling `POST /api/auth/signup` with `"role": "ADMIN"` returns a 400 error. Admin accounts can only be created through the seeded `schema.sql` data or a protected internal endpoint.

---

### ISSUE 1.4 — File Upload Endpoints Are Publicly Accessible Without Authentication

**Severity:** CRITICAL  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/config/SecurityConfig.java`  
**Method:** `filterChain(HttpSecurity http)`

**What is wrong:**  
The security configuration has this rule:
```java
.requestMatchers("/api/files/**").permitAll()
```
This permits ALL requests to `/api/files/**` — including the upload endpoints — without any authentication. An anonymous attacker can upload arbitrary files to the server's filesystem.

**What to do:**

Replace the single blanket rule with split rules that only permit public access to file downloads (GET), while requiring authentication for uploads (POST):

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    // Only GET (download/serve) is public — upload endpoints require authentication
    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/files/**").permitAll()
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/swagger-ui.html").permitAll()
    .anyRequest().authenticated()
)
```

Also verify that the upload controller endpoints already have appropriate `@PreAuthorize` annotations (they do for vehicle image and CNIC endpoints, but the profile picture endpoint currently has none — add it):

In `FileController.java`, add to the profile picture upload method:
```java
@PostMapping(value = "/upload/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("isAuthenticated()")   // <-- ADD THIS
public ResponseEntity<User> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
```

**Expected result:** `GET /api/files/profiles/some-image.jpg` works without auth (needed for displaying images). `POST /api/files/upload/*` requires a valid JWT token. Anonymous file upload attempts return 401.

---

### ISSUE 1.5 — No File Type Validation on Uploads (Arbitrary File Upload / Path Traversal)

**Severity:** CRITICAL  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/FileStorageServiceImpl.java`  
**Method:** `storeFile(MultipartFile file, String subDir)`

**What is wrong:**

Problem A — No MIME type or extension validation: The method accepts any file type. An attacker can upload `.jsp`, `.sh`, `.php`, `.exe`, `.html`, or any other file. If the server ever executes or interprets uploaded files, this is remote code execution.

Problem B — The `subDir` parameter is not validated: It is passed in directly from the controller without sanitization. A malformed value like `../../etc` could potentially escape the upload directory.

Problem C — No file size check at the service level (only Spring's multipart max-size config).

**What to do:**

Replace the `storeFile` method with this hardened version:

```java
private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
    ".jpg", ".jpeg", ".png", ".gif", ".webp"
);

private static final Set<String> ALLOWED_SUB_DIRS = Set.of(
    "profiles", "vehicles", "cnics"
);

private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Override
public String storeFile(MultipartFile file, String subDir) {
    // Validate subDir against whitelist
    if (!ALLOWED_SUB_DIRS.contains(subDir)) {
        throw new RuntimeException("Invalid upload directory.");
    }

    // Validate file is not empty
    if (file.isEmpty()) {
        throw new RuntimeException("Uploaded file is empty.");
    }

    // Validate file size
    if (file.getSize() > MAX_FILE_SIZE_BYTES) {
        throw new RuntimeException("File size exceeds the maximum allowed limit of 10MB.");
    }

    // Validate original filename is safe
    String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
    if (originalFileName == null || originalFileName.isBlank() || originalFileName.contains("..")) {
        throw new RuntimeException("Invalid file name.");
    }

    // Extract and validate file extension
    String extension = "";
    int dotIndex = originalFileName.lastIndexOf('.');
    if (dotIndex >= 0) {
        extension = originalFileName.substring(dotIndex).toLowerCase();
    }
    if (!ALLOWED_EXTENSIONS.contains(extension)) {
        throw new RuntimeException("File type not allowed. Only JPG, PNG, GIF, and WEBP images are accepted.");
    }

    // Validate MIME type matches extension
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
        throw new RuntimeException("Only image files are accepted.");
    }

    // Generate safe unique filename
    String fileName = UUID.randomUUID().toString() + extension;

    try {
        Path targetDir = this.fileStorageLocation.resolve(subDir).normalize();
        // Ensure targetDir is still inside fileStorageLocation (path traversal guard)
        if (!targetDir.startsWith(this.fileStorageLocation)) {
            throw new RuntimeException("Invalid upload directory path.");
        }
        Files.createDirectories(targetDir);
        Path targetLocation = targetDir.resolve(fileName).normalize();
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return "/api/files/" + subDir + "/" + fileName;
    } catch (IOException ex) {
        throw new RuntimeException("Could not store file. Please try again!", ex);
    }
}
```

Also add the `cnics` subdirectory to the constructor initialization:
```java
public FileStorageServiceImpl() {
    this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
    try {
        Files.createDirectories(this.fileStorageLocation);
        Files.createDirectories(this.fileStorageLocation.resolve("profiles"));
        Files.createDirectories(this.fileStorageLocation.resolve("vehicles"));
        Files.createDirectories(this.fileStorageLocation.resolve("cnics")); // <-- ADD THIS
    } catch (IOException ex) {
        throw new RuntimeException("Could not create the upload directory.", ex);
    }
}
```

**Expected result:** Only image files with valid extensions and MIME types can be uploaded. Path traversal via `subDir` is blocked. Invalid file types return a clear 400 error.

---

### ISSUE 1.6 — Race Condition on Wallet Balance (No Pessimistic Lock)

**Severity:** CRITICAL  
**Files:**  
- `campus-rides/backend/src/main/java/com/campus/rides/service/impl/BookingServiceImpl.java` — `createBooking()`  
- `campus-rides/backend/src/main/java/com/campus/rides/service/impl/WalletServiceImpl.java` — `deposit()`  
- `campus-rides/backend/src/main/java/com/campus/rides/repository/PassengerRepository.java`

**What is wrong:**  
The wallet deduction is a non-atomic read-modify-write sequence:
```java
passenger.setWalletBalance(passenger.getWalletBalance() - totalCost); // reads then writes
passengerRepository.save(passenger);
```
If two concurrent booking requests arrive for the same passenger at the same time, both will read the same original balance, both will subtract independently, and both will save — resulting in the balance being deducted only once instead of twice, allowing the passenger to double-spend.

**What to do:**

Step 1 — Add a `@Version` field to the `Passenger` entity for optimistic locking:
```java
// In Passenger.java
import jakarta.persistence.Version;

@Version
@Column(name = "version")
private Long version = 0L;

// Add getter and setter:
public Long getVersion() { return version; }
public void setVersion(Long version) { this.version = version; }
```

Step 2 — Add the `version` column to the passengers table in `schema.sql`:
```sql
ALTER TABLE passengers ADD COLUMN version BIGINT DEFAULT 0;
```
Or update the `CREATE TABLE` statement for passengers:
```sql
CREATE TABLE IF NOT EXISTS passengers (
    user_id INT PRIMARY KEY,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,   -- also fix type here, see Issue 2.5
    version BIGINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Step 3 — Add a pessimistic write lock query to `PassengerRepository.java` for use in the booking service:
```java
// In PassengerRepository.java
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Passenger p WHERE p.id = :id")
Optional<Passenger> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);
```

Step 4 — In `BookingServiceImpl.createBooking()`, replace:
```java
Passenger passenger = passengerRepository.findById(user.getId())
        .orElseThrow(() -> new RuntimeException("Logged in user is not registered as a Passenger!"));
```
With:
```java
Passenger passenger = passengerRepository.findByIdWithLock(user.getId())
        .orElseThrow(() -> new RuntimeException("Logged in user is not registered as a Passenger!"));
```

Apply the same locking in `WalletServiceImpl.deposit()`.

**Expected result:** Concurrent booking requests for the same passenger are serialized at the database level. Double-spending is impossible.

---

### ISSUE 1.7 — reset_pass.sql Clears Root Password to Empty String

**Severity:** CRITICAL  
**File:** `reset_pass.sql` (repo root)

**What is wrong:**  
The file ends with:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
```
This removes the MySQL root password entirely. This file is in a public repository and any developer who runs it (or whose tooling auto-runs SQL files) will be left with an unprotected database.

**What to do:**

Step 1 — Remove the `ALTER USER` statement that sets an empty password from `reset_pass.sql`.

Step 2 — Replace it with a placeholder comment:
```sql
-- Run this SQL to reset the root password to a secure value.
-- Replace 'your_secure_password_here' with an actual strong password.
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_secure_password_here';
-- FLUSH PRIVILEGES;
```

Step 3 — Add `reset_pass.sql` to `.gitignore` since it contains sensitive operational commands:
```gitignore
reset_pass.sql
reset_mysql.ps1
```

Step 4 — Similarly sanitize `reset_mysql.ps1` — remove or comment out any hardcoded credentials or commands that drop security measures.

**Expected result:** No file in the repository removes, clears, or weakens database authentication credentials.

---

## PART 2 — BUGS AND LOGIC ERRORS (Fix After Security Issues)

---

### ISSUE 2.1 — Drivers Are Auto-Approved on Signup (Verification System Is Bypassed)

**Severity:** HIGH BUG  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/AuthServiceImpl.java`  
**Method:** `signup()` — driver creation block

**What is wrong:**  
Newly registered drivers are immediately set as fully verified:
```java
driver.setVerified(true); // Auto-approve newly registered drivers for campus demo
driver.setVerificationStatus(VerificationStatus.APPROVED);
```
This makes the entire admin verification workflow, CNIC upload system, and driver approval dashboard completely non-functional — they exist in the codebase but have zero effect because every driver is pre-approved.

**What to do:**

Remove those two lines. The driver should start in the default `PENDING` state (which is already the entity default):
```java
Driver driver = new Driver(
        request.getUsername(),
        request.getEmail(),
        encodedPassword,
        request.getFullName(),
        request.getPhoneNumber(),
        request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-PENDING"
);
// DO NOT call driver.setVerified(true) or driver.setVerificationStatus(APPROVED)
// The driver entity defaults to isVerified=false, verificationStatus=PENDING
```

**Expected result:** Newly registered drivers have `verificationStatus = PENDING` and cannot post rides until an admin approves them via `POST /api/admin/drivers/{id}/verify?approve=true`.

---

### ISSUE 2.2 — Duplicate OTP Generation When Driver Accepts a Passenger Ride Request

**Severity:** MEDIUM BUG  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/PassengerRideRequestServiceImpl.java`  
**Method:** `acceptRequest()`

**What is wrong:**  
When creating a booking for an accepted ride request, the code:
1. Calls `new Booking(savedRide, prr.getPassenger(), ...)` — the `Booking` constructor already generates a 4-digit OTP internally using `Math.random()`
2. Immediately overwrites it with a second randomly generated OTP: `booking.setOtpCode(otp)` where `otp = String.format("%04d", new Random().nextInt(10000))`

The first OTP is generated and silently discarded. The booking is saved with the second OTP. This is redundant, confusing, and error-prone (two different `Random` instances, two different generation strategies).

**What to do:**

Remove the redundant second OTP generation. Let the `Booking` constructor handle it (it already does). Delete these lines:
```java
// DELETE THESE LINES:
// Generate 4 digit OTP
String otp = String.format("%04d", new Random().nextInt(10000));
booking.setOtpCode(otp);
```

The booking creation block should simply be:
```java
Booking booking = new Booking(
        savedRide,
        prr.getPassenger(),
        prr.getSeatsNeeded(),
        prr.getFareOffered()
);
booking.setStatus(BookingStatus.CONFIRMED);
// OTP is already generated by the Booking constructor — do not overwrite it
bookingRepository.save(booking);
```

Also remove the `import java.util.Random;` statement if it is no longer used after this change.

**Expected result:** Each booking has exactly one OTP, generated once, by the Booking constructor.

---

### ISSUE 2.3 — Ride Status Transitions Have No Validation (Illegal State Changes Allowed)

**Severity:** HIGH BUG  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/RideServiceImpl.java`  
**Method:** `updateRideStatus(Long id, String driverUsername, RideStatus status)`

**What is wrong:**  
The method accepts any target status without checking whether the current status allows that transition. This means:
- A `COMPLETED` ride can be set back to `CREATED`
- A `CANCELLED` ride can be set to `ONGOING`
- A `CREATED` ride can jump directly to `COMPLETED` (skipping `ONGOING`, bypassing check-in OTP verification)
- A driver can complete a ride before it even starts to avoid refund obligations

**What to do:**

Add a state transition validation map inside `updateRideStatus()`:

```java
@Override
@Transactional
public Ride updateRideStatus(Long id, String driverUsername, RideStatus newStatus) {
    Ride ride = getRideById(id);
    if (!ride.getDriver().getUsername().equals(driverUsername)) {
        throw new RuntimeException("You are not authorized to update this ride's status!");
    }

    // Define allowed transitions
    RideStatus currentStatus = ride.getStatus();
    boolean isValidTransition = switch (currentStatus) {
        case CREATED  -> newStatus == RideStatus.ONGOING || newStatus == RideStatus.CANCELLED;
        case ONGOING  -> newStatus == RideStatus.COMPLETED || newStatus == RideStatus.CANCELLED;
        case COMPLETED, CANCELLED -> false; // Terminal states — no transitions allowed
    };

    if (!isValidTransition) {
        throw new RuntimeException(
            "Invalid status transition: cannot move ride from " + currentStatus + " to " + newStatus + "."
        );
    }

    if (newStatus == RideStatus.CANCELLED) {
        cancelAndRefundBookings(ride);
    }

    ride.setStatus(newStatus);
    return rideRepository.save(ride);
}
```

**Expected result:** Status transitions follow the valid lifecycle: `CREATED → ONGOING → COMPLETED` or `CREATED/ONGOING → CANCELLED`. All other transitions are rejected with a clear error message.

---

### ISSUE 2.4 — Admin Analytics Performs Multiple Full Table Scans in Memory

**Severity:** MEDIUM BUG / PERFORMANCE  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/service/impl/AdminServiceImpl.java`  
**Method:** `getAnalytics()`

**What is wrong:**  
The analytics endpoint does the following inefficient queries:
- `rideRepository.findByStatus(RideStatus.CREATED)` — full table scan
- `rideRepository.findByStatus(RideStatus.ONGOING)` — second full table scan
- `rideRepository.findByStatus(RideStatus.COMPLETED)` — third full table scan
- `rideRepository.findByStatus(RideStatus.CANCELLED)` — fourth full table scan
- `bookingRepository.findAll()` — loads EVERY booking into memory, then streams over them to sum revenue
- `complaintRepository.findAllByOrderByCreatedAtDesc()` — loads ALL complaints twice for count and pending filter

This will cause serious performance degradation and potential out-of-memory errors as the dataset grows.

**What to do:**

Step 1 — Add aggregate query methods to the repositories:

In `RideRepository.java`:
```java
@Query("SELECT COUNT(r) FROM Ride r WHERE r.status = :status")
long countByStatus(@Param("status") RideStatus status);
```

In `BookingRepository.java`:
```java
@Query("SELECT COALESCE(SUM(b.farePaid), 0) FROM Booking b WHERE b.status = :status")
double sumFarePaidByStatus(@Param("status") BookingStatus status);
```

In `ComplaintRepository.java`:
```java
long countByStatus(ComplaintStatus status);
```

Step 2 — Rewrite `getAnalytics()` to use aggregate queries:
```java
@Override
public AnalyticsResponse getAnalytics() {
    long totalRides     = rideRepository.count();
    long activeRides    = rideRepository.countByStatus(RideStatus.CREATED)
                        + rideRepository.countByStatus(RideStatus.ONGOING);
    long completedRides = rideRepository.countByStatus(RideStatus.COMPLETED);
    long cancelledRides = rideRepository.countByStatus(RideStatus.CANCELLED);

    double totalRevenue = bookingRepository.sumFarePaidByStatus(BookingStatus.CONFIRMED);
    totalRevenue = Math.round(totalRevenue * 100.0) / 100.0;

    long totalUsers      = userRepository.count();
    long totalDrivers    = driverRepository.count();
    long totalPassengers = passengerRepository.count();
    long totalComplaints = complaintRepository.count();
    long pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.PENDING);

    return new AnalyticsResponse(
        totalRides, activeRides, completedRides, cancelledRides,
        totalRevenue, totalUsers, totalDrivers, totalPassengers,
        totalComplaints, pendingComplaints
    );
}
```

**Expected result:** Analytics are computed with a single SQL aggregation per metric instead of loading all records into memory.

---

### ISSUE 2.5 — Rating Score Has No Validation (Any Integer Accepted)

**Severity:** MEDIUM BUG  
**Files:**
- `campus-rides/backend/src/main/java/com/campus/rides/dto/RatingRequest.java`
- `campus-rides/backend/src/main/resources/schema.sql` — ratings table

**What is wrong:**  
The `score` field in `RatingRequest` has no `@Min` or `@Max` constraint. A client can submit a rating of `-999` or `100000`. The database schema also has no CHECK constraint on the score column.

**What to do:**

In `RatingRequest.java`, add validation:
```java
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RatingRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Score is required")
    @Min(value = 1, message = "Rating score must be at least 1")
    @Max(value = 5, message = "Rating score must not exceed 5")
    private Integer score;

    private String comment;

    private boolean isDriverReview;

    // Getters and setters...
}
```

In `schema.sql`, update the ratings table to add a CHECK constraint:
```sql
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    passenger_id INT NOT NULL,
    driver_id INT NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),  -- <-- ADD CHECK CONSTRAINT
    comment TEXT,
    is_driver_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Also add `@Valid` to the rating endpoint in `UserController.java` if it is not already present.

**Expected result:** Submitting a rating with score < 1 or > 5 returns a 400 validation error. The DB also enforces the constraint.

---

### ISSUE 2.6 — Runtime Crash: `navigate` Is Not Defined in DashboardPage

**Severity:** HIGH BUG — Runtime Crash  
**File:** `campus-rides/carpool-frontend/src/pages/DashboardPage.jsx`

**What is wrong:**  
The "Find a Ride" button in the empty bookings state calls `navigate('/search')`:
```jsx
<button className="btn btn-primary mt-4" onClick={() => navigate('/search')}>
  Find a Ride
</button>
```
But `navigate` is never defined in the component. The `useNavigate` hook from React Router is imported nowhere and never called. Clicking this button throws:
```
ReferenceError: navigate is not defined
```

**What to do:**

At the top of `DashboardPage.jsx`, import `useNavigate`:
```jsx
import { useNavigate } from 'react-router-dom';
```

Inside the component function body (near the top, alongside other hooks):
```jsx
const DashboardPage = ({ user: initialUser }) => {
  const navigate = useNavigate();  // <-- ADD THIS LINE
  const [user, setUser] = useState(initialUser);
  // ... rest of state
```

**Expected result:** Clicking "Find a Ride" when the passenger has no bookings correctly navigates to `/search`.

---

### ISSUE 2.7 — Seed Booking in schema.sql Has No OTP Code

**Severity:** MEDIUM BUG  
**File:** `campus-rides/backend/src/main/resources/schema.sql`  
**Section:** Seed Bookings

**What is wrong:**  
The seeded test booking is inserted with `status = 'CONFIRMED'` but no `otp_code`:
```sql
INSERT IGNORE INTO bookings (id, ride_id, passenger_id, seats_booked, fare_paid, status, created_at)
VALUES (1, 1, 4, 1, 5.00, 'CONFIRMED', NOW());
```
Since `otp_code` defaults to `NULL`, the driver dashboard will show no OTP input form (because the UI checks `b.otpCode !== 'VERIFIED'`), and the passenger will have no OTP to present. The OTP check-in feature is completely broken for all seed data.

**What to do:**

Add an OTP code to the seeded booking:
```sql
INSERT IGNORE INTO bookings (id, ride_id, passenger_id, seats_booked, fare_paid, status, otp_code, created_at)
VALUES (1, 1, 4, 1, 5.00, 'CONFIRMED', '4821', NOW());
```

Also deduct the corresponding amount from the seeded passenger's wallet to keep the data consistent (the passenger alex_green has $150 wallet balance but has a confirmed booking for $5):
```sql
-- Update wallet balance for seeded booking payment
INSERT IGNORE INTO wallet_transactions (id, passenger_id, amount, type, description, created_at)
VALUES (3, 4, 5.00, 'PAYMENT', 'Seed booking payment - Main Gate Circle -> Engineering Block B', NOW());
```
And update alex_green's wallet balance seed:
```sql
INSERT IGNORE INTO passengers (user_id, wallet_balance)
VALUES (4, 145.00);  -- Was 150.00, deduct 5.00 for confirmed booking
```

**Expected result:** The seeded booking has a valid OTP (`4821`) that the driver can enter to verify check-in during testing.

---

### ISSUE 2.8 — Wallet Deposit Has No Maximum Amount Limit

**Severity:** MEDIUM BUG  
**Files:**
- `campus-rides/backend/src/main/java/com/campus/rides/service/impl/WalletServiceImpl.java`
- `campus-rides/backend/src/main/java/com/campus/rides/controller/WalletController.java`

**What is wrong:**  
The deposit service only checks `amount > 0`. There is no upper limit. A user could deposit `Double.MAX_VALUE`, causing arithmetic overflow in subsequent wallet operations, database storage issues, and breaking the financial simulation.

**What to do:**

In `WalletServiceImpl.java`, add a maximum deposit guard:
```java
private static final double MAX_SINGLE_DEPOSIT = 10_000.00;
private static final double MAX_WALLET_BALANCE = 50_000.00;

@Override
@Transactional
public Passenger deposit(String passengerUsername, double amount) {
    if (amount <= 0) {
        throw new RuntimeException("Deposit amount must be greater than zero!");
    }
    if (amount > MAX_SINGLE_DEPOSIT) {
        throw new RuntimeException("Maximum single deposit amount is $" + MAX_SINGLE_DEPOSIT + ".");
    }

    // ... fetch passenger ...

    double newBalance = passenger.getWalletBalance() + amount;
    if (newBalance > MAX_WALLET_BALANCE) {
        throw new RuntimeException("This deposit would exceed the maximum wallet balance of $" + MAX_WALLET_BALANCE + ".");
    }

    passenger.setWalletBalance(newBalance);
    // ... rest of method
}
```

Also add validation in `WalletController.java`:
```java
@PostMapping("/deposit")
@PreAuthorize("hasRole('PASSENGER')")
public ResponseEntity<Passenger> deposit(
        @RequestParam @DecimalMin(value = "0.01", message = "Deposit must be at least $0.01")
        @DecimalMax(value = "10000.00", message = "Maximum deposit is $10,000")
        double amount) {
```
(Add the `import jakarta.validation.constraints.DecimalMin;` and `import jakarta.validation.constraints.DecimalMax;` imports.)

**Expected result:** Deposits of $0 or less, deposits over $10,000, or deposits that would push balance over $50,000 are rejected with a clear error.

---

## PART 3 — CODE QUALITY AND RISK ISSUES (Fix After Bugs)

---

### ISSUE 3.1 — JWT Secret Is Not Validated for Minimum Length at Startup

**Severity:** MEDIUM RISK  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/config/JwtTokenProvider.java`

**What is wrong:**  
`Keys.hmacShaKeyFor(jwtSecret.getBytes())` will throw a `WeakKeyException` at runtime (on the first token generation/validation) if `JWT_SECRET` is shorter than 32 bytes for HS256. This causes a cryptic error that is hard to diagnose.

**What to do:**

Add a `@PostConstruct` startup validation:
```java
import jakarta.annotation.PostConstruct;

@PostConstruct
public void validateJwtSecret() {
    if (jwtSecret == null || jwtSecret.isBlank()) {
        throw new IllegalStateException(
            "JWT secret is not configured. Set the JWT_SECRET environment variable."
        );
    }
    if (jwtSecret.getBytes().length < 32) {
        throw new IllegalStateException(
            "JWT secret is too short. It must be at least 32 characters long for HS256."
        );
    }
}
```

**Expected result:** If `JWT_SECRET` is missing or too short, the application fails fast at startup with a clear error message instead of failing at the first authentication request.

---

### ISSUE 3.2 — HTTP Basic Authentication Is Enabled Alongside JWT (Conflicting Auth Methods)

**Severity:** MEDIUM RISK  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/config/SecurityConfig.java`

**What is wrong:**  
The security config has:
```java
.httpBasic(Customizer.withDefaults());
```
This enables HTTP Basic auth in addition to the JWT filter. Spring will try to find a `UserDetailsService` bean to process Basic auth credentials, but no such bean is defined. This causes either:
- An `UnsatisfiedDependencyException` at startup, or
- A 500 error whenever a request arrives with a `Basic` Authorization header

The app uses JWT exclusively and does not need Basic auth at all.

**What to do:**

Remove the `.httpBasic()` line entirely:
```java
// DELETE THIS LINE:
.httpBasic(Customizer.withDefaults());
```

Also remove the `import org.springframework.security.config.Customizer;` import if it is no longer used.

**Expected result:** Only JWT Bearer token authentication works. HTTP Basic auth requests return 401. No `UserDetailsService` lookup is attempted.

---

### ISSUE 3.3 — JWT Filter Silently Swallows All Exceptions (No Logging)

**Severity:** MEDIUM RISK  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/config/JwtAuthenticationFilter.java`

**What is wrong:**  
The catch block is completely empty:
```java
} catch (Exception ex) {
    // Log security failure
}
```
The comment says "Log security failure" but nothing is actually logged. Malformed tokens, tampered tokens, and expired tokens all fail silently. This makes security monitoring and debugging impossible.

**What to do:**

Add proper logging to the catch block:
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // ... existing fields ...

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // ... existing auth logic ...
            }
        } catch (Exception ex) {
            logger.warn("Could not set user authentication from JWT token. URI: {}, Error: {}",
                    request.getRequestURI(), ex.getMessage());
            // Clear any partial authentication state
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
```

**Expected result:** Failed JWT validations are logged as WARN-level events with the request URI and error message, making security monitoring and debugging feasible.

---

### ISSUE 3.4 — CORS Configuration Is Hardcoded for Localhost (Will Break in Production)

**Severity:** MEDIUM RISK  
**File:** `campus-rides/backend/src/main/java/com/campus/rides/config/SecurityConfig.java`  
**Method:** `corsConfigurationSource()`

**What is wrong:**  
Allowed origins are hardcoded:
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",
    "http://127.0.0.1:*"
));
```
This will cause CORS failures in any non-localhost environment (staging, production, Docker containers with different hostnames). It also accepts any port on localhost, which is broader than necessary.

**What to do:**

Step 1 — In `application.properties`, add a configurable CORS origins property:
```properties
# CORS Configuration
campus.rides.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}
```

Step 2 — Inject it into `SecurityConfig.java`:
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${campus.rides.cors.allowed-origins}")
    private String allowedOriginsConfig;

    // ...

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.asList(allowedOriginsConfig.split(","));
        configuration.setAllowedOriginPatterns(origins);

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Expected result:** CORS origins are controlled via environment variable. In development, `CORS_ALLOWED_ORIGINS` defaults to localhost. In production, it is set to the actual frontend domain.

---

### ISSUE 3.5 — All Monetary Values Use `double` / `DOUBLE` Instead of Decimal Types

**Severity:** HIGH RISK  
**Files:**
- `campus-rides/backend/src/main/java/com/campus/rides/entity/Passenger.java` — `walletBalance`
- `campus-rides/backend/src/main/java/com/campus/rides/entity/Booking.java` — `farePaid`
- `campus-rides/backend/src/main/java/com/campus/rides/entity/Ride.java` — `baseFare`
- `campus-rides/backend/src/main/java/com/campus/rides/entity/WalletTransaction.java` — `amount`
- `campus-rides/backend/src/main/java/com/campus/rides/entity/PassengerRideRequest.java` — `fareOffered`
- `campus-rides/backend/src/main/resources/schema.sql` — multiple `DOUBLE` columns

**What is wrong:**  
IEEE 754 double-precision floating-point cannot exactly represent most decimal fractions. For example, `0.1 + 0.2 = 0.30000000000000004` in double. Over many wallet transactions, these rounding errors accumulate. The `Math.round(x * 100.0) / 100.0` workarounds scattered throughout the codebase are a symptom of this underlying problem and do not fully fix it.

**What to do:**

In all entity files, change `double` fields for money to `BigDecimal`:

```java
// In Passenger.java
import java.math.BigDecimal;

@Column(name = "wallet_balance", precision = 10, scale = 2)
private BigDecimal walletBalance = BigDecimal.ZERO;

public BigDecimal getWalletBalance() { return walletBalance; }
public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }
```

Apply the same change (`double` → `BigDecimal`) to:
- `Booking.farePaid`
- `Ride.baseFare`
- `WalletTransaction.amount`
- `PassengerRideRequest.fareOffered`

In `schema.sql`, change all `DOUBLE` money columns to `DECIMAL(10,2)`:
```sql
wallet_balance DECIMAL(10,2) DEFAULT 0.00,
base_fare DECIMAL(10,2) NOT NULL,
fare_paid DECIMAL(10,2) NOT NULL,
amount DECIMAL(10,2) NOT NULL,
fare_offered DECIMAL(10,2) NOT NULL,
```

Update all arithmetic in the service layer to use `BigDecimal` methods:
```java
// Instead of: passenger.getWalletBalance() - totalCost
passenger.setWalletBalance(passenger.getWalletBalance().subtract(totalCost));

// Instead of: passenger.getWalletBalance() + amount
passenger.setWalletBalance(passenger.getWalletBalance().add(amount));

// Instead of: Math.round(calculatedFare * 100.0) / 100.0
calculatedFare = calculatedFare.setScale(2, RoundingMode.HALF_UP);
```

Remove all `Math.round(x * 100.0) / 100.0` calls after migrating to `BigDecimal`.

Update `AnalyticsResponse.java` and `AuthResponse.java` to use `BigDecimal` for the wallet/revenue fields as well.

Update DTO classes (`BookingRequest.java`, `RideRequest.java`, `PassengerRideRequestRequest.java`) to use `BigDecimal` for fare fields.

**Expected result:** All monetary arithmetic is exact. No floating-point rounding drift. Financial calculations are correct regardless of how many transactions have been applied.

---

### ISSUE 3.6 — All Services Use Field Injection Instead of Constructor Injection

**Severity:** LOW / Code Quality  
**Files:** All `*ServiceImpl.java`, `*Controller.java`, `SecurityConfig.java`, `JwtAuthenticationFilter.java`

**What is wrong:**  
All dependencies are injected with `@Autowired` on private fields. This pattern:
- Makes unit testing without a Spring context impossible (fields cannot be set directly)
- Hides dependencies (a class with 8 `@Autowired` fields has 8 hidden dependencies)
- Prevents `final` declarations (objects are not immutable)
- Is the pattern Spring itself now discourages in its official documentation

**What to do:**

Convert all `@Autowired` field injection to constructor injection. Use Lombok `@RequiredArgsConstructor` for brevity:

Add Lombok to `pom.xml` if not already present:
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

Example conversion for `BookingServiceImpl.java`:
```java
// BEFORE:
@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RideRepository rideRepository;
    // ...
}

// AFTER:
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    // ...
}
```

Apply this pattern to every service implementation and every controller. Remove all `@Autowired` annotations on fields after this change.

**Expected result:** All dependencies are declared as `final` fields with a single constructor. Classes are easily unit-testable by instantiating them with mock dependencies.

---

## PART 4 — FINAL CHECKLIST

After applying all fixes above, verify the following:

### Backend

- [ ] `mvn clean compile` completes with zero errors
- [ ] `mvn spring-boot:run` starts successfully with no exceptions in logs
- [ ] `POST /api/auth/signup` with `"role": "ADMIN"` returns 400
- [ ] `POST /api/auth/signup` with `"role": "DRIVER"` creates a PENDING driver (not auto-approved)
- [ ] `POST /api/files/upload/profile-picture` without Authorization header returns 401
- [ ] `GET /api/files/profiles/any-file.jpg` works without Authorization header
- [ ] Uploading a `.exe` or `.sh` file returns 400
- [ ] `POST /api/wallet/deposit?amount=99999999` returns 400
- [ ] `POST /api/auth/login` with valid credentials returns a JWT token
- [ ] Analytics endpoint uses DB aggregation (verify with SQL query log)
- [ ] JWT secret shorter than 32 chars causes a startup failure with a clear message

### Frontend

- [ ] `npm run dev` starts with zero errors
- [ ] `npm run build` completes with zero errors and no warnings about undefined variables
- [ ] Navigating to the dashboard as a passenger with no bookings and clicking "Find a Ride" navigates to `/search` without throwing a ReferenceError
- [ ] Deposit form rejects amounts below $0.01 or above $10,000
- [ ] Driver dashboard shows verification status as PENDING for new drivers

### Repository

- [ ] `git ls-files | grep -E '\.(ibd|pem|ibdata|dblwr)$'` returns nothing
- [ ] `mysql_db/` and `mysql_fresh/` directories do not exist in the working tree or in git history
- [ ] `.gitignore` covers all database files, PEM files, and sensitive scripts

---

## Notes for Copilot

- Fix issues in the order listed. Security issues first, then logic bugs, then code quality.
- Do not introduce any new dependencies beyond what is listed (Lombok, BigDecimal are already in scope).
- Do not change the REST API paths or HTTP methods — only fix the implementations.
- Do not remove any existing feature. Every UI component and API endpoint must remain functional after all fixes.
- When changing field types from `double` to `BigDecimal`, update every usage site in the same pass — do not leave any code that mixes the two types.
- The database schema (`schema.sql`) is the single source of truth for table structure. Any entity change must be reflected in `schema.sql`.
- All new exception messages must be user-readable (no stack traces, no internal class names).
