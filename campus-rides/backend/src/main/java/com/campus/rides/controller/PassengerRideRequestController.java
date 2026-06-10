package com.campus.rides.controller;

import com.campus.rides.dto.PassengerRideRequestRequest;
import com.campus.rides.entity.PassengerRideRequest;
import com.campus.rides.service.PassengerRideRequestService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/ride-requests")
@Tag(name = "Passenger Ride Request API", description = "Endpoints for passengers to post custom ride requests and drivers to accept/reject them.")
public class PassengerRideRequestController {

    @Autowired
    private PassengerRideRequestService passengerRideRequestService;

    @PostMapping
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Passenger posts a custom Ride Request", description = "Creates a pending request and holds passenger's wallet balance.")
    public ResponseEntity<PassengerRideRequest> createRequest(@Valid @RequestBody PassengerRideRequestRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PassengerRideRequest created = passengerRideRequestService.createRequest(username, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/passenger")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Passenger gets their own Ride Requests", description = "Fetches a full list of requests submitted by the passenger.")
    public ResponseEntity<List<PassengerRideRequest>> getPassengerRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<PassengerRideRequest> list = passengerRideRequestService.getPassengerRequests(username);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Driver lists all pending Passenger Ride Requests", description = "Fetches pending requests available for drivers to pick up.")
    public ResponseEntity<List<PassengerRideRequest>> getPendingRequests() {
        List<PassengerRideRequest> list = passengerRideRequestService.getPendingRequests();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Driver accepts a Passenger Ride Request", description = "Transitions status to ACCEPTED, auto-creates an active Ride and a Confirmed Booking.")
    public ResponseEntity<PassengerRideRequest> acceptRequest(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PassengerRideRequest accepted = passengerRideRequestService.acceptRequest(id, username);
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Driver rejects a Passenger Ride Request", description = "Transitions status to REJECTED and refunds passenger's held wallet balance.")
    public ResponseEntity<PassengerRideRequest> rejectRequest(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PassengerRideRequest rejected = passengerRideRequestService.rejectRequest(id, username);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Passenger cancels their own Ride Request", description = "Transitions status to CANCELLED and refunds passenger's held wallet balance.")
    public ResponseEntity<PassengerRideRequest> cancelRequest(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PassengerRideRequest cancelled = passengerRideRequestService.cancelRequest(id, username);
        return ResponseEntity.ok(cancelled);
    }
}
