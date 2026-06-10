package com.campus.rides.service;

import com.campus.rides.dto.ProfileRequest;
import com.campus.rides.entity.Rating;
import com.campus.rides.entity.User;
import java.util.List;

public interface UserService {
    User getProfile(String username);
    User updateProfile(String username, ProfileRequest request);
    User uploadProfilePicture(String username, String imageUrl);
    User uploadVehicleImage(String username, String imageUrl);
    User uploadCnicFront(String username, String imageUrl);
    User uploadCnicBack(String username, String imageUrl);
    List<Rating> getDriverRatings(Long driverId);
    void addRating(String username, Long bookingId, int score, String comment, boolean isDriverReview);
}
