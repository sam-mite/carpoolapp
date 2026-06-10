package com.campus.rides.controller;

import com.campus.rides.dto.ProfileRequest;
import com.campus.rides.dto.RatingRequest;
import com.campus.rides.entity.Rating;
import com.campus.rides.entity.User;
import com.campus.rides.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile API", description = "Endpoints for managing user profile details, vehicle profiles, and driver ratings.")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile details", description = "Retrieves information about the currently logged-in user, including role details.")
    public ResponseEntity<User> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User profile = userService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile details", description = "Modifies basic contact attributes and driver vehicle settings.")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody ProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User updated = userService.updateProfile(username, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/ratings")
    @Operation(summary = "Get ratings for a Driver", description = "Fetches a historical list of passenger reviews and ratings for a driver by user ID.")
    public ResponseEntity<List<Rating>> getDriverRatings(@PathVariable Long id) {
        List<Rating> ratings = userService.getDriverRatings(id);
        return ResponseEntity.ok(ratings);
    }

    @PostMapping("/rate")
    @Operation(summary = "Submit rating review", description = "Submits a booking evaluation and rating (1-5 stars) for either driver or passenger.")
    public ResponseEntity<Map<String, String>> rateUser(@Valid @RequestBody RatingRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.addRating(username, request.getBookingId(), request.getScore(), request.getComment(), request.isDriverReview());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rating submitted successfully!");
        return ResponseEntity.ok(response);
    }
}
