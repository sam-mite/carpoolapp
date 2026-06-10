package com.campus.rides.service.impl;

import com.campus.rides.dto.RideRequest;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.RideService;
import com.campus.rides.service.strategy.FareStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideServiceImpl implements RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    @Qualifier("standardFareStrategy")
    private FareStrategy standardFareStrategy;

    @Autowired
    @Qualifier("surgeFareStrategy")
    private FareStrategy surgeFareStrategy;

    @Autowired
    @Qualifier("discountFareStrategy")
    private FareStrategy discountFareStrategy;

    @Override
    @Transactional
    public Ride createRide(String driverUsername, RideRequest request) {
        User user = userRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new RuntimeException("Driver not found!"));

        Driver driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Logged in user is not a driver!"));

        Vehicle vehicle = vehicleRepository.findByDriverId(driver.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle details not registered! Please register your vehicle first."));

        // Determine Polymorphic pricing strategy dynamically
        FareStrategy chosenStrategy = standardFareStrategy;
        int hour = request.getDepartureTime().getHour();
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
            chosenStrategy = surgeFareStrategy; // Peak hours on campus
        } else if (hour >= 21 || hour <= 6) {
            chosenStrategy = discountFareStrategy; // Night/Off-peak discount
        }

        // Dynamically compute fare utilizing chosen Strategy
        double calculatedFare = chosenStrategy.calculateFare(request.getBaseFare());

        // Keep 2 decimal places
        calculatedFare = Math.round(calculatedFare * 100.0) / 100.0;

        Ride ride = new Ride(
                driver,
                vehicle,
                request.getDepartureLocation(),
                request.getDestinationLocation(),
                request.getDepartureTime(),
                request.getTotalSeats(),
                calculatedFare
        );

        return rideRepository.save(ride);
    }

    @Override
    public List<Ride> searchRides(String departure, String destination, int seats) {
        // Sanitize search arguments and format search patterns
        String dep = (departure != null && !departure.trim().isEmpty()) ? "%" + departure.trim().toLowerCase() + "%" : null;
        String dest = (destination != null && !destination.trim().isEmpty()) ? "%" + destination.trim().toLowerCase() + "%" : null;
        int reqSeats = Math.max(1, seats);

        return rideRepository.searchRides(RideStatus.CREATED, dep, dest, reqSeats);
    }

    @Override
    public List<Ride> getDriverRides(String driverUsername) {
        User user = userRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new RuntimeException("Driver not found!"));
        return rideRepository.findByDriverId(user.getId());
    }

    @Override
    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + id));
    }

    @Override
    @Transactional
    public Ride updateRide(Long id, String driverUsername, RideRequest request) {
        Ride ride = getRideById(id);
        if (!ride.getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to update this ride!");
        }
        if (ride.getStatus() != RideStatus.CREATED) {
            throw new RuntimeException("Rides can only be modified in the CREATED status!");
        }

        // Calculate currently booked seats
        List<Booking> bookings = bookingRepository.findByRideId(id);
        int bookedSeats = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .mapToInt(Booking::getSeatsBooked)
                .sum();

        if (request.getTotalSeats() < bookedSeats) {
            throw new RuntimeException("Cannot reduce capacity below currently booked seats (" + bookedSeats + ")!");
        }

        ride.setDepartureLocation(request.getDepartureLocation());
        ride.setDestinationLocation(request.getDestinationLocation());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(request.getTotalSeats() - bookedSeats);
        ride.setBaseFare(request.getBaseFare());

        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public void deleteRide(Long id, String driverUsername) {
        Ride ride = getRideById(id);
        if (!ride.getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to delete this ride!");
        }

        // Cancel bookings and process refunds automatically
        cancelAndRefundBookings(ride);

        rideRepository.delete(ride);
    }

    @Override
    @Transactional
    public Ride updateRideStatus(Long id, String driverUsername, RideStatus status) {
        Ride ride = getRideById(id);
        if (!ride.getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not authorized to update this ride's status!");
        }

        if (status == RideStatus.CANCELLED) {
            cancelAndRefundBookings(ride);
        }

        ride.setStatus(status);
        return rideRepository.save(ride);
    }

    private void cancelAndRefundBookings(Ride ride) {
        List<Booking> bookings = bookingRepository.findByRideId(ride.getId());
        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);

                // Refund passenger wallet
                Passenger passenger = booking.getPassenger();
                passenger.setWalletBalance(passenger.getWalletBalance() + booking.getFarePaid());
                passengerRepository.save(passenger);

                // Log Refund
                WalletTransaction txn = new WalletTransaction(
                        passenger,
                        booking.getFarePaid(),
                        TransactionType.REFUND,
                        "Refund: Ride " + ride.getDepartureLocation() + " -> " + ride.getDestinationLocation() + " cancelled by driver."
                );
                walletTransactionRepository.save(txn);
            }
        }
    }
}
