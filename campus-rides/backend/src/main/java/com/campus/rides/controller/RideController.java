package com.campus.rides.controller;

import com.campus.rides.dto.RideRequest;
import com.campus.rides.entity.Ride;
import com.campus.rides.entity.RideStatus;
import com.campus.rides.service.RideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@Tag(name = "Ride Management API", description = "Endpoints for creating carpools, searching rides, and updating active trip states.")
public class RideController {

    @Autowired
    private RideService rideService;

    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Post a new carpool Ride", description = "Allows registered drivers to schedule a campus carpool with coordinates and pricing.")
    public ResponseEntity<Ride> createRide(@Valid @RequestBody RideRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Ride ride = rideService.createRide(username, request);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/search")
    @Operation(summary = "Search for available Rides", description = "Queries upcoming rides by departure location, destination, and seats requested.")
    public ResponseEntity<List<Ride>> searchRides(
            @Parameter(description = "Departure location filter (partial match)") @RequestParam(required = false) String departure,
            @Parameter(description = "Destination location filter (partial match)") @RequestParam(required = false) String destination,
            @Parameter(description = "Number of passenger seats required") @RequestParam(defaultValue = "1") int seats) {
        
        List<Ride> rides = rideService.searchRides(departure, destination, seats);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/driver")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get driver's posted rides", description = "Fetches a full list of rides posted by the authenticated driver.")
    public ResponseEntity<List<Ride>> getDriverRides() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Ride> rides = rideService.getDriverRides(username);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ride details", description = "Retrieves information for a single ride, including coordinate locations and driver profile.")
    public ResponseEntity<Ride> getRideById(@PathVariable Long id) {
        Ride ride = rideService.getRideById(id);
        return ResponseEntity.ok(ride);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Update a posted Ride", description = "Modifies times, destinations, capacity, and cost properties of a pending ride.")
    public ResponseEntity<Ride> updateRide(@PathVariable Long id, @Valid @RequestBody RideRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Ride updated = rideService.updateRide(id, username, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Delete/Cancel a posted Ride", description = "Deletes a pending ride from schedule, triggering full automatic passenger wallet refunds.")
    public ResponseEntity<Map<String, String>> deleteRide(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        rideService.deleteRide(id, username);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ride cancelled and passenger bookings refunded successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Transition Ride trip status", description = "Sets ride status flags (CREATED, ONGOING, COMPLETED, CANCELLED) to track active trip states.")
    public ResponseEntity<Ride> updateStatus(@PathVariable Long id, @RequestParam RideStatus status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Ride updated = rideService.updateRideStatus(id, username, status);
        return ResponseEntity.ok(updated);
    }
}
