package com.campus.rides.service.impl;

import com.campus.rides.dto.AnalyticsResponse;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void suspendUser(Long userId, boolean suspend) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        
        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("System Administrators cannot be suspended!");
        }
        
        user.setSuspended(suspend);
        userRepository.save(user);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public void resolveComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found!"));
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaintRepository.save(complaint);
    }

    @Override
    public AnalyticsResponse getAnalytics() {
        long totalRides = rideRepository.count();
        long activeRides = rideRepository.findByStatus(RideStatus.CREATED).size() + rideRepository.findByStatus(RideStatus.ONGOING).size();
        long completedRides = rideRepository.findByStatus(RideStatus.COMPLETED).size();
        long cancelledRides = rideRepository.findByStatus(RideStatus.CANCELLED).size();

        // Calculate Revenue from confirmed bookings
        double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getFarePaid)
                .sum();
        totalRevenue = Math.round(totalRevenue * 100.0) / 100.0;

        long totalUsers = userRepository.count();
        long totalDrivers = driverRepository.count();
        long totalPassengers = passengerRepository.count();
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> c.getStatus() == ComplaintStatus.PENDING)
                .count();

        return new AnalyticsResponse(
                totalRides,
                activeRides,
                completedRides,
                cancelledRides,
                totalRevenue,
                totalUsers,
                totalDrivers,
                totalPassengers,
                totalComplaints,
                pendingComplaints
        );
    }

    @Override
    @Transactional
    public void verifyDriver(Long driverId, boolean approve) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found!"));
        
        if (approve) {
            driver.setVerificationStatus(VerificationStatus.APPROVED);
            driver.setVerified(true);
        } else {
            driver.setVerificationStatus(VerificationStatus.REJECTED);
            driver.setVerified(false);
        }
        driverRepository.save(driver);
    }
}
