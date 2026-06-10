package com.campus.rides.repository;

import com.campus.rides.entity.PassengerRideRequest;
import com.campus.rides.entity.PassengerRideRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PassengerRideRequestRepository extends JpaRepository<PassengerRideRequest, Long> {
    List<PassengerRideRequest> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);
    List<PassengerRideRequest> findByStatusOrderByCreatedAtDesc(PassengerRideRequestStatus status);
}
