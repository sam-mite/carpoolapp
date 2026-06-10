package com.campus.rides.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class PassengerRideRequestRequest {

    @NotBlank(message = "Pick-up location is required")
    private String departureLocation;

    @NotBlank(message = "Destination location is required")
    private String destinationLocation;


    @NotNull(message = "Departure date and time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @NotNull(message = "Seats needed is required")
    @Min(value = 1, message = "Seats needed must be at least 1")
    private Integer seatsNeeded;

    @NotNull(message = "Fare offered is required")
    @DecimalMin(value = "0.1", message = "Fare offered must be at least $0.10")
    private Double fareOffered;

    // Getters and Setters
    public String getDepartureLocation() { return departureLocation; }
    public void setDepartureLocation(String departureLocation) { this.departureLocation = departureLocation; }

    public String getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(String destinationLocation) { this.destinationLocation = destinationLocation; }


    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public Integer getSeatsNeeded() { return seatsNeeded; }
    public void setSeatsNeeded(Integer seatsNeeded) { this.seatsNeeded = seatsNeeded; }

    public Double getFareOffered() { return fareOffered; }
    public void setFareOffered(Double fareOffered) { this.fareOffered = fareOffered; }
}
