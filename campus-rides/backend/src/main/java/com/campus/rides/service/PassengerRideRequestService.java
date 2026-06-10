package com.campus.rides.service;

import com.campus.rides.dto.PassengerRideRequestRequest;
import com.campus.rides.entity.PassengerRideRequest;
import java.util.List;

public interface PassengerRideRequestService {
    PassengerRideRequest createRequest(String passengerUsername, PassengerRideRequestRequest request);
    List<PassengerRideRequest> getPassengerRequests(String passengerUsername);
    List<PassengerRideRequest> getPendingRequests();
    PassengerRideRequest acceptRequest(Long requestId, String driverUsername);
    PassengerRideRequest rejectRequest(Long requestId, String driverUsername);
    PassengerRideRequest cancelRequest(Long requestId, String passengerUsername);
}
