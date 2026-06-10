package com.campus.rides.dto;

public class AnalyticsResponse {
    private long totalRides;
    private long activeRides;
    private long completedRides;
    private long cancelledRides;
    private double totalRevenue;
    private long totalUsers;
    private long totalDrivers;
    private long totalPassengers;
    private long totalComplaints;
    private long pendingComplaints;

    public AnalyticsResponse() {}

    public AnalyticsResponse(long totalRides, long activeRides, long completedRides, long cancelledRides, 
                             double totalRevenue, long totalUsers, long totalDrivers, long totalPassengers, 
                             long totalComplaints, long pendingComplaints) {
        this.totalRides = totalRides;
        this.activeRides = activeRides;
        this.completedRides = completedRides;
        this.cancelledRides = cancelledRides;
        this.totalRevenue = totalRevenue;
        this.totalUsers = totalUsers;
        this.totalDrivers = totalDrivers;
        this.totalPassengers = totalPassengers;
        this.totalComplaints = totalComplaints;
        this.pendingComplaints = pendingComplaints;
    }

    // Getters and Setters
    public long getTotalRides() { return totalRides; }
    public void setTotalRides(long totalRides) { this.totalRides = totalRides; }

    public long getActiveRides() { return activeRides; }
    public void setActiveRides(long activeRides) { this.activeRides = activeRides; }

    public long getCompletedRides() { return completedRides; }
    public void setCompletedRides(long completedRides) { this.completedRides = completedRides; }

    public long getCancelledRides() { return cancelledRides; }
    public void setCancelledRides(long cancelledRides) { this.cancelledRides = cancelledRides; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(long totalDrivers) { this.totalDrivers = totalDrivers; }

    public long getTotalPassengers() { return totalPassengers; }
    public void setTotalPassengers(long totalPassengers) { this.totalPassengers = totalPassengers; }

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public long getPendingComplaints() { return pendingComplaints; }
    public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }
}
