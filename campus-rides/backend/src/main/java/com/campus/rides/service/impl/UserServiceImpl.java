package com.campus.rides.service.impl;

import com.campus.rides.dto.ProfileRequest;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile not found with username: " + username));
    }

    @Override
    @Transactional
    public User updateProfile(String username, ProfileRequest request) {
        User user = getProfile(username);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        if (user.getRole() == UserRole.DRIVER) {
            Driver driver = driverRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Driver record not found!"));
            driver.setLicenseNumber(request.getLicenseNumber());
            if (request.getCnicNumber() != null) {
                driver.setCnicNumber(request.getCnicNumber());
            }
            driverRepository.save(driver);

            Vehicle vehicle = vehicleRepository.findByDriverId(driver.getId())
                    .orElseThrow(() -> new RuntimeException("Vehicle record not found!"));
            vehicle.setMake(request.getMake());
            vehicle.setModel(request.getModel());
            vehicle.setLicensePlate(request.getLicensePlate());
            vehicle.setColor(request.getColor());
            vehicle.setCapacity(request.getCapacity());
            vehicleRepository.save(vehicle);
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User uploadProfilePicture(String username, String imageUrl) {
        User user = getProfile(username);
        user.setProfilePictureUrl(imageUrl);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User uploadVehicleImage(String username, String imageUrl) {
        User user = getProfile(username);
        if (user.getRole() != UserRole.DRIVER) {
            throw new RuntimeException("Only drivers can upload vehicle images!");
        }

        Vehicle vehicle = vehicleRepository.findByDriverId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle record not found!"));
        vehicle.setImageUrl(imageUrl);
        vehicleRepository.save(vehicle);

        return user;
    }

    @Override
    @Transactional
    public User uploadCnicFront(String username, String imageUrl) {
        User user = getProfile(username);
        if (user.getRole() != UserRole.DRIVER) {
            throw new RuntimeException("Only drivers can upload CNIC documents!");
        }

        Driver driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Driver record not found!"));
        driver.setCnicFrontUrl(imageUrl);
        driverRepository.save(driver);

        return user;
    }

    @Override
    @Transactional
    public User uploadCnicBack(String username, String imageUrl) {
        User user = getProfile(username);
        if (user.getRole() != UserRole.DRIVER) {
            throw new RuntimeException("Only drivers can upload CNIC documents!");
        }

        Driver driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Driver record not found!"));
        driver.setCnicBackUrl(imageUrl);
        driverRepository.save(driver);

        return user;
    }

    @Override
    public List<Rating> getDriverRatings(Long driverId) {
        return ratingRepository.findByDriverId(driverId);
    }

    @Override
    @Transactional
    public void addRating(String username, Long bookingId, int score, String comment, boolean isDriverReview) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (booking.getRide().getStatus() != RideStatus.COMPLETED) {
            throw new RuntimeException("Reviews can only be submitted for completed rides!");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Passenger passenger = booking.getPassenger();
        Driver driver = booking.getRide().getDriver();

        if (isDriverReview) {
            // Driver reviewing passenger
            if (!driver.getId().equals(user.getId())) {
                throw new RuntimeException("You can only submit reviews for bookings on your own rides!");
            }
            if (ratingRepository.existsByBookingIdAndIsDriverReview(bookingId, true)) {
                throw new RuntimeException("You have already rated this passenger for this trip!");
            }
            Rating rating = new Rating(booking, passenger, driver, score, comment, true);
            ratingRepository.save(rating);
        } else {
            // Passenger reviewing driver
            if (!passenger.getId().equals(user.getId())) {
                throw new RuntimeException("You can only rate drivers for your own bookings!");
            }
            if (ratingRepository.existsByBookingIdAndIsDriverReview(bookingId, false)) {
                throw new RuntimeException("You have already rated this driver for this trip!");
            }
            Rating rating = new Rating(booking, passenger, driver, score, comment, false);
            ratingRepository.save(rating);
        }
    }
}
