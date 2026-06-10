package com.campus.rides.service.impl;

import com.campus.rides.dto.PassengerRideRequestRequest;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.PassengerRideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Random;

@Service
public class PassengerRideRequestServiceImpl implements PassengerRideRequestService {

    @Autowired
    private PassengerRideRequestRepository passengerRideRequestRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public PassengerRideRequest createRequest(String passengerUsername, PassengerRideRequestRequest request) {
        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("Passenger not found!"));

        Passenger passenger = passengerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Logged in user is not a Passenger!"));

        double fare = request.getFareOffered();
        if (passenger.getWalletBalance() < fare) {
            throw new RuntimeException("Insufficient wallet balance! Fare offered: $" + fare + ", Balance: $" + passenger.getWalletBalance());
        }

        // Deduct/hold wallet balance
        passenger.setWalletBalance(passenger.getWalletBalance() - fare);
        passengerRepository.save(passenger);

        // Save wallet transaction log
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                fare,
                TransactionType.PAYMENT,
                "Held funds for ride request: " + request.getDepartureLocation() + " -> " + request.getDestinationLocation()
        );
        walletTransactionRepository.save(transaction);

        // Create PassengerRideRequest
        PassengerRideRequest prr = new PassengerRideRequest(
                passenger,
                request.getDepartureLocation(),
                request.getDestinationLocation(),
                request.getDepartureTime(),
                request.getSeatsNeeded(),
                request.getFareOffered()
        );

        return passengerRideRequestRepository.save(prr);
    }

    @Override
    public List<PassengerRideRequest> getPassengerRequests(String passengerUsername) {
        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return passengerRideRequestRepository.findByPassengerIdOrderByCreatedAtDesc(user.getId());
    }

    @Override
    public List<PassengerRideRequest> getPendingRequests() {
        return passengerRideRequestRepository.findByStatusOrderByCreatedAtDesc(PassengerRideRequestStatus.PENDING);
    }

    @Override
    @Transactional
    public PassengerRideRequest acceptRequest(Long requestId, String driverUsername) {
        PassengerRideRequest prr = passengerRideRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found!"));

        if (prr.getStatus() != PassengerRideRequestStatus.PENDING) {
            throw new RuntimeException("This request is no longer pending!");
        }

        User user = userRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new RuntimeException("Driver not found!"));

        Driver driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Logged in user is not registered as a Driver!"));

        if (!driver.isVerified()) {
            throw new RuntimeException("Your driver profile is not verified by administrators yet!");
        }

        Vehicle vehicle = driver.getVehicle();
        if (vehicle == null) {
            throw new RuntimeException("Please register your vehicle in your profile before accepting rides!");
        }

        if (vehicle.getCapacity() < prr.getSeatsNeeded()) {
            throw new RuntimeException("Your vehicle does not have enough capacity (" + vehicle.getCapacity() + " seats) for this request (" + prr.getSeatsNeeded() + " seats needed)!");
        }

        // Transition status of request
        prr.setStatus(PassengerRideRequestStatus.ACCEPTED);
        passengerRideRequestRepository.save(prr);

        // Create the Ride
        double baseFare = Math.round((prr.getFareOffered() / prr.getSeatsNeeded()) * 100.0) / 100.0;
        Ride ride = new Ride(
                driver,
                vehicle,
                prr.getDepartureLocation(),
                prr.getDestinationLocation(),
                prr.getDepartureTime(),
                vehicle.getCapacity(),
                baseFare
        );
        ride.setAvailableSeats(vehicle.getCapacity() - prr.getSeatsNeeded());
        Ride savedRide = rideRepository.save(ride);

        // Create the Booking
        Booking booking = new Booking(
                savedRide,
                prr.getPassenger(),
                prr.getSeatsNeeded(),
                prr.getFareOffered()
        );
        booking.setStatus(BookingStatus.CONFIRMED);

        // Generate 4 digit OTP
        String otp = String.format("%04d", new Random().nextInt(10000));
        booking.setOtpCode(otp);
        bookingRepository.save(booking);

        return prr;
    }

    @Override
    @Transactional
    public PassengerRideRequest rejectRequest(Long requestId, String driverUsername) {
        PassengerRideRequest prr = passengerRideRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found!"));

        if (prr.getStatus() != PassengerRideRequestStatus.PENDING) {
            throw new RuntimeException("Only pending ride requests can be rejected!");
        }

        // Transition status to REJECTED
        prr.setStatus(PassengerRideRequestStatus.REJECTED);
        passengerRideRequestRepository.save(prr);

        // Refund passenger wallet
        Passenger passenger = prr.getPassenger();
        passenger.setWalletBalance(passenger.getWalletBalance() + prr.getFareOffered());
        passengerRepository.save(passenger);

        // Log transaction
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                prr.getFareOffered(),
                TransactionType.REFUND,
                "Refund for rejected ride request: " + prr.getDepartureLocation() + " -> " + prr.getDestinationLocation()
        );
        walletTransactionRepository.save(transaction);

        return prr;
    }

    @Override
    @Transactional
    public PassengerRideRequest cancelRequest(Long requestId, String passengerUsername) {
        PassengerRideRequest prr = passengerRideRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found!"));

        if (prr.getStatus() != PassengerRideRequestStatus.PENDING) {
            throw new RuntimeException("Only pending ride requests can be cancelled!");
        }

        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("Passenger not found!"));

        if (!prr.getPassenger().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to cancel this request!");
        }

        // Transition status to CANCELLED
        prr.setStatus(PassengerRideRequestStatus.CANCELLED);
        passengerRideRequestRepository.save(prr);

        // Refund passenger wallet
        Passenger passenger = prr.getPassenger();
        passenger.setWalletBalance(passenger.getWalletBalance() + prr.getFareOffered());
        passengerRepository.save(passenger);

        // Log transaction
        WalletTransaction transaction = new WalletTransaction(
                passenger,
                prr.getFareOffered(),
                TransactionType.REFUND,
                "Refund for cancelled ride request: " + prr.getDepartureLocation() + " -> " + prr.getDestinationLocation()
        );
        walletTransactionRepository.save(transaction);

        return prr;
    }
}
