package com.campus.rides.service;

import com.campus.rides.dto.RideRequest;
import com.campus.rides.entity.Ride;
import com.campus.rides.entity.RideStatus;
import java.util.List;

public interface RideService {
    Ride createRide(String driverUsername, RideRequest request);
    List<Ride> searchRides(String departure, String destination, int seats);
    List<Ride> getDriverRides(String driverUsername);
    Ride getRideById(Long id);
    Ride updateRide(Long id, String driverUsername, RideRequest request);
    void deleteRide(Long id, String driverUsername);
    Ride updateRideStatus(Long id, String driverUsername, RideStatus status);
}
