package com.campus.rides.repository;

import com.campus.rides.entity.Ride;
import com.campus.rides.entity.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriverId(Long driverId);
    List<Ride> findByStatus(RideStatus status);

    @Query("SELECT r FROM Ride r WHERE r.status = :status AND " +
           "(:departure IS NULL OR LOWER(r.departureLocation) LIKE :departure) AND " +
           "(:destination IS NULL OR LOWER(r.destinationLocation) LIKE :destination) AND " +
           "r.availableSeats >= :seats")
    List<Ride> searchRides(@Param("status") RideStatus status, 
                           @Param("departure") String departure, 
                           @Param("destination") String destination, 
                           @Param("seats") int seats);
}
