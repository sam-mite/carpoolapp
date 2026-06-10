package com.campus.rides.controller;

import com.campus.rides.dto.BookingRequest;
import com.campus.rides.entity.Booking;
import com.campus.rides.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Booking API", description = "Endpoints for scheduling seat reservations, managing booking lists, and processing cancellations.")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Book seats in a carpool Ride", description = "Creates a pending reservation request and holds ride cost from passenger balance.")
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = bookingService.createBooking(username, request);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/passenger")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "View passenger booking history", description = "Fetches a full historical log of reservations created by the passenger.")
    public ResponseEntity<List<Booking>> getPassengerBookings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Booking> bookings = bookingService.getPassengerBookings(username);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/driver")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "View bookings on driver's rides", description = "Returns passenger reservations booked across the driver's schedule.")
    public ResponseEntity<List<Booking>> getDriverBookings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Booking> bookings = bookingService.getDriverBookings(username);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Cancel a reservation", description = "Cancels a booked seat or request, returning seats to driver and processing refunds to passenger balance.")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking cancelled = bookingService.cancelBooking(id, username);
        return ResponseEntity.ok(cancelled);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Approve a booking request", description = "Drivers approve a pending passenger carpool request.")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking approved = bookingService.approveBooking(id, username);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Reject a booking request", description = "Drivers deny a pending passenger request, returning held fares and seat allocations.")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking rejected = bookingService.rejectBooking(id, username);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{id}/verify-otp")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Verify passenger check-in OTP", description = "Drivers input passenger OTPs at pick-up to verify presence.")
    public ResponseEntity<Booking> verifyOtp(@PathVariable Long id, @RequestParam String otp) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = bookingService.verifyOtp(id, username, otp);
        return ResponseEntity.ok(booking);
    }
}
