package com.campus.rides.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "passenger_ride_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PassengerRideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    @JsonIgnoreProperties({"walletBalance", "password", "email", "phoneNumber", "profilePictureUrl", "role", "suspended", "createdAt"})
    private Passenger passenger;

    @Column(name = "departure_location", nullable = false, length = 100)
    private String departureLocation;

    @Column(name = "destination_location", nullable = false, length = 100)
    private String destinationLocation;


    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "seats_needed", nullable = false)
    private int seatsNeeded;

    @Column(name = "fare_offered", nullable = false)
    private double fareOffered;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PassengerRideRequestStatus status = PassengerRideRequestStatus.PENDING;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public PassengerRideRequest() {}

    public PassengerRideRequest(Passenger passenger, String departureLocation, String destinationLocation, 
                                LocalDateTime departureTime, int seatsNeeded, double fareOffered) {
        this.passenger = passenger;
        this.departureLocation = departureLocation;
        this.destinationLocation = destinationLocation;
        this.departureTime = departureTime;
        this.seatsNeeded = seatsNeeded;
        this.fareOffered = fareOffered;
        this.status = PassengerRideRequestStatus.PENDING;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Passenger getPassenger() { return passenger; }
    public void setPassenger(Passenger passenger) { this.passenger = passenger; }

    public String getDepartureLocation() { return departureLocation; }
    public void setDepartureLocation(String departureLocation) { this.departureLocation = departureLocation; }

    public String getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(String destinationLocation) { this.destinationLocation = destinationLocation; }


    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public int getSeatsNeeded() { return seatsNeeded; }
    public void setSeatsNeeded(int seatsNeeded) { this.seatsNeeded = seatsNeeded; }

    public double getFareOffered() { return fareOffered; }
    public void setFareOffered(double fareOffered) { this.fareOffered = fareOffered; }

    public PassengerRideRequestStatus getStatus() { return status; }
    public void setStatus(PassengerRideRequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
