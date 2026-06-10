package com.campus.rides.service.impl;

import com.campus.rides.dto.BookingRequest;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public Booking createBooking(String passengerUsername, BookingRequest request) {
        // Fetch ride
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found!"));

        if (ride.getStatus() != RideStatus.CREATED) {
            throw new RuntimeException("Rides can only be requested before they start!");
        }

        // Validate seats
        if (ride.getAvailableSeats() < request.getSeatsBooked()) {
            throw new RuntimeException("Not enough seats available! Available seats: " + ride.getAvailableSeats());
        }

        // Fetch passenger
        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("Passenger not found!"));

        Passenger passenger = passengerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Logged in user is not registered as a Passenger!"));

        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new RuntimeException("You cannot book seats on your own ride!");
        }

        // Check if booking already exists
        List<Booking> passengerBookings = bookingRepository.findByPassengerId(passenger.getId());
        for (Booking b : passengerBookings) {
            if (b.getRide().getId().equals(ride.getId()) && (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)) {
                throw new RuntimeException("You already have an active request or confirmed booking for this ride!");
            }
        }

        // Calculate total cost
        double totalCost = ride.getBaseFare() * request.getSeatsBooked();
        totalCost = Math.round(totalCost * 100.0) / 100.0;

        if (passenger.getWalletBalance() < totalCost) {
            throw new RuntimeException("Insufficient wallet balance! Cost: $" + totalCost + ", Balance: $" + passenger.getWalletBalance());
        }

        // Deduct from wallet immediately (hold/lock funds)
        passenger.setWalletBalance(passenger.getWalletBalance() - totalCost);
        passengerRepository.save(passenger);

        // Update ride seats immediately (prevent overbooking)
        ride.setAvailableSeats(ride.getAvailableSeats() - request.getSeatsBooked());
        rideRepository.save(ride);

        // Log payment transaction
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                totalCost,
                TransactionType.PAYMENT,
                "Requested " + request.getSeatsBooked() + " seat(s) for Ride " + ride.getDepartureLocation() + " -> " + ride.getDestinationLocation() + " (Funds Held)"
        );
        walletTransactionRepository.save(transaction);

        // Create booking as PENDING
        Booking booking = new Booking(ride, passenger, request.getSeatsBooked(), totalCost);
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getPassengerBookings(String passengerUsername) {
        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("Passenger not found!"));
        return bookingRepository.findByPassengerId(user.getId());
    }

    @Override
    public List<Booking> getDriverBookings(String driverUsername) {
        User user = userRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new RuntimeException("Driver not found!"));
        return bookingRepository.findByRideDriverId(user.getId());
    }

    @Override
    @Transactional
    public Booking cancelBooking(Long id, String passengerUsername) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("Passenger not found!"));

        if (!booking.getPassenger().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to cancel this booking!");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled!");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new RuntimeException("Booking is already rejected!");
        }

        Ride ride = booking.getRide();

        // Check if ride is completed
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel bookings for completed rides!");
        }

        // Cancel booking status
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Refund passenger wallet
        Passenger passenger = booking.getPassenger();
        passenger.setWalletBalance(passenger.getWalletBalance() + booking.getFarePaid());
        passengerRepository.save(passenger);

        // Return seats to ride
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        // Log refund transaction
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                booking.getFarePaid(),
                TransactionType.REFUND,
                "Cancelled booking request for Ride " + ride.getDepartureLocation() + " -> " + ride.getDestinationLocation()
        );
        walletTransactionRepository.save(transaction);

        return booking;
    }

    @Override
    @Transactional
    public Booking approveBooking(Long id, String driverUsername) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (!booking.getRide().getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to approve bookings for this ride!");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved!");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking rejectBooking(Long id, String driverUsername) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (!booking.getRide().getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to reject bookings for this ride!");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected!");
        }

        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);

        // Refund passenger wallet
        Passenger passenger = booking.getPassenger();
        passenger.setWalletBalance(passenger.getWalletBalance() + booking.getFarePaid());
        passengerRepository.save(passenger);

        // Return seats to ride
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        // Log refund transaction
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                booking.getFarePaid(),
                TransactionType.REFUND,
                "Booking request rejected by driver for Ride " + ride.getDepartureLocation() + " -> " + ride.getDestinationLocation()
        );
        walletTransactionRepository.save(transaction);

        return booking;
    }

    @Override
    @Transactional
    public Booking verifyOtp(Long id, String driverUsername, String otp) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (!booking.getRide().getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to verify OTPs for this ride!");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("OTPs can only be verified for CONFIRMED bookings!");
        }

        if (booking.getOtpCode() == null || !booking.getOtpCode().equals(otp.trim())) {
            throw new RuntimeException("Invalid OTP code submitted!");
        }

        // OTP is correct! Clear it to prevent reuse and mark check-in successful.
        booking.setOtpCode("VERIFIED");
        return bookingRepository.save(booking);
    }
}
