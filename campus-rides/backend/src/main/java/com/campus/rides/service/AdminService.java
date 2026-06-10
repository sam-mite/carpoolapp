package com.campus.rides.service;

import com.campus.rides.dto.AnalyticsResponse;
import com.campus.rides.entity.Booking;
import com.campus.rides.entity.Complaint;
import com.campus.rides.entity.User;
import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    void suspendUser(Long userId, boolean suspend);
    List<Booking> getAllBookings();
    List<Complaint> getAllComplaints();
    void resolveComplaint(Long complaintId);
    AnalyticsResponse getAnalytics();
    void verifyDriver(Long driverId, boolean approve);
}
