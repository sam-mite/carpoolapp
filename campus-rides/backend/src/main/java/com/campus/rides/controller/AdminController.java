package com.campus.rides.controller;

import com.campus.rides.dto.AnalyticsResponse;
import com.campus.rides.entity.Booking;
import com.campus.rides.entity.Complaint;
import com.campus.rides.entity.User;
import com.campus.rides.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Panel API", description = "Endpoints for platform metrics, user controls, booking monitors, and case auditing. (Admin only)")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "List all registered accounts", description = "Retrieves a master list of all users, drivers, and passengers.")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend or Unsuspend a User", description = "Revokes or restores platform access. Suspended users are locked out of authentication.")
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable Long id, @RequestParam boolean suspend) {
        adminService.suspendUser(id, suspend);
        Map<String, String> response = new HashMap<>();
        String msg = suspend ? "User account suspended successfully!" : "User account active again!";
        response.put("message", msg);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings")
    @Operation(summary = "Monitor all system Bookings", description = "Allows administrators to monitor carpool bookings across the system.")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = adminService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/complaints")
    @Operation(summary = "Review all registered complaints", description = "Lists all passenger and driver complaints submitted in the system.")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = adminService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    @PostMapping("/complaints/{id}/resolve")
    @Operation(summary = "Mark a complaint ticket RESOLVED", description = "Transitions complaint status flags, marking tickets completed.")
    public ResponseEntity<Map<String, String>> resolveComplaint(@PathVariable Long id) {
        adminService.resolveComplaint(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Complaint resolved successfully!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Retrieve platform dashboard statistics", description = "Retrieves critical system statistics including total rides, active count, financial revenues, passenger ratios, and open cases.")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        AnalyticsResponse analytics = adminService.getAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @PostMapping("/drivers/{id}/verify")
    @Operation(summary = "Verify or Reject a Driver's documents", description = "Allows administrators to approve or reject a driver's CNIC and vehicle credentials.")
    public ResponseEntity<Map<String, String>> verifyDriver(@PathVariable Long id, @RequestParam boolean approve) {
        adminService.verifyDriver(id, approve);
        Map<String, String> response = new HashMap<>();
        String msg = approve ? "Driver approved successfully!" : "Driver credentials rejected!";
        response.put("message", msg);
        return ResponseEntity.ok(response);
    }
}
