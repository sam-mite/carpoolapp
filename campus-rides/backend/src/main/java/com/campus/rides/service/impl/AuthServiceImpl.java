package com.campus.rides.service.impl;

import com.campus.rides.config.JwtTokenProvider;
import com.campus.rides.dto.AuthRequest;
import com.campus.rides.dto.AuthResponse;
import com.campus.rides.dto.SignupRequest;
import com.campus.rides.entity.*;
import com.campus.rides.repository.*;
import com.campus.rides.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        if (request.getRole() == UserRole.DRIVER) {
            if (request.getLicensePlate() != null && vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
                throw new RuntimeException("License plate already registered!");
            }
            
            Driver driver = new Driver(
                    request.getUsername(),
                    request.getEmail(),
                    encodedPassword,
                    request.getFullName(),
                    request.getPhoneNumber(),
                    request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-PENDING"
            );
            driver.setVerified(true); // Auto-approve newly registered drivers for campus demo
            driver.setVerificationStatus(VerificationStatus.APPROVED);

            // Save Driver first
            Driver savedDriver = driverRepository.save(driver);

            // Create and associate vehicle
            Vehicle vehicle = new Vehicle(
                    savedDriver,
                    request.getMake() != null ? request.getMake() : "Unknown",
                    request.getModel() != null ? request.getModel() : "Unknown",
                    request.getLicensePlate() != null ? request.getLicensePlate() : "PL-" + System.currentTimeMillis(),
                    request.getColor() != null ? request.getColor() : "Black",
                    request.getCapacity() != null ? request.getCapacity() : 4
            );
            vehicleRepository.save(vehicle);

        } else if (request.getRole() == UserRole.PASSENGER) {
            Passenger passenger = new Passenger(
                    request.getUsername(),
                    request.getEmail(),
                    encodedPassword,
                    request.getFullName(),
                    request.getPhoneNumber()
            );
            passenger.setWalletBalance(0.0);
            passengerRepository.save(passenger);
            
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
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password!"));

        if (user.isSuspended()) {
            throw new RuntimeException("Account has been suspended! Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password!");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        double walletBalance = 0.0;
        if (user.getRole() == UserRole.PASSENGER) {
            Passenger passenger = passengerRepository.findById(user.getId()).orElse(null);
            if (passenger != null) {
                walletBalance = passenger.getWalletBalance();
            }
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getProfilePictureUrl(),
                walletBalance,
                user.isSuspended()
        );
    }
}
