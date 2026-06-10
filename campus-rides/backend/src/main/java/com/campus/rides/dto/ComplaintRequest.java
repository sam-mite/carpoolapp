package com.campus.rides.dto;

import jakarta.validation.constraints.NotBlank;

public class ComplaintRequest {
    private Long rideId;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    // Getters and Setters
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
