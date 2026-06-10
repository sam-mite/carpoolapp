package com.campus.rides.repository;

import com.campus.rides.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByDriverId(Long driverId);
    List<Rating> findByPassengerId(Long passengerId);
    boolean existsByBookingId(Long bookingId);
    boolean existsByBookingIdAndIsDriverReview(Long bookingId, boolean isDriverReview);
}
