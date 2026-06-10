package com.campus.rides.service;

import com.campus.rides.dto.BookingRequest;
import com.campus.rides.entity.Booking;
import java.util.List;

public interface BookingService {
    Booking createBooking(String passengerUsername, BookingRequest request);
    List<Booking> getPassengerBookings(String passengerUsername);
    List<Booking> getDriverBookings(String driverUsername);
    Booking cancelBooking(Long id, String passengerUsername);
    Booking approveBooking(Long id, String driverUsername);
    Booking rejectBooking(Long id, String driverUsername);
    Booking verifyOtp(Long id, String driverUsername, String otp);
}
