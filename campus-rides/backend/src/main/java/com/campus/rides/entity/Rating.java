package com.campus.rides.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "ratings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({"ride", "passenger"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    @JsonIgnoreProperties({"password", "email", "phoneNumber", "profilePictureUrl"})
    private Passenger passenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnoreProperties({"vehicle", "password", "email", "phoneNumber", "profilePictureUrl"})
    private Driver driver;

    @Column(nullable = false)
    private int score;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_driver_review")
    private boolean isDriverReview = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Rating() {}

    public Rating(Booking booking, Passenger passenger, Driver driver, int score, String comment) {
        this.booking = booking;
        this.passenger = passenger;
        this.driver = driver;
        this.score = score;
        this.comment = comment;
        this.isDriverReview = false;
    }

    public Rating(Booking booking, Passenger passenger, Driver driver, int score, String comment, boolean isDriverReview) {
        this.booking = booking;
        this.passenger = passenger;
        this.driver = driver;
        this.score = score;
        this.comment = comment;
        this.isDriverReview = isDriverReview;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Passenger getPassenger() { return passenger; }
    public void setPassenger(Passenger passenger) { this.passenger = passenger; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public boolean isDriverReview() { return isDriverReview; }
    public void setDriverReview(boolean driverReview) { isDriverReview = driverReview; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
