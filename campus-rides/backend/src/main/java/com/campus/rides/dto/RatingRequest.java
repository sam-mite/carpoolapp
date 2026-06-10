package com.campus.rides.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RatingRequest {
    @NotNull
    private Long bookingId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    private String comment;

    @JsonProperty("isDriverReview")
    private boolean isDriverReview = false;

    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    @JsonProperty("isDriverReview")
    public boolean isDriverReview() { return isDriverReview; }

    @JsonProperty("isDriverReview")
    public void setDriverReview(boolean driverReview) { isDriverReview = driverReview; }
}
