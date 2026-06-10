package com.campus.rides.repository;

import com.campus.rides.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);
    @Query("SELECT b FROM Booking b WHERE b.ride.driver.id = :driverId")
    List<Booking> findByRideDriverId(@Param("driverId") Long driverId);
    List<Booking> findByRideId(Long rideId);
}
