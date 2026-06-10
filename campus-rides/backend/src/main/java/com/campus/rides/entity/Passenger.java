package com.campus.rides.entity;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "passengers")
@PrimaryKeyJoinColumn(name = "user_id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Passenger extends User {

    @Column(name = "wallet_balance")
    private double walletBalance = 0.0;

    // Constructors
    public Passenger() {
        super();
    }

    public Passenger(String username, String email, String password, String fullName, String phoneNumber) {
        super(username, email, password, UserRole.PASSENGER, fullName, phoneNumber);
        this.walletBalance = 0.0;
    }

    // Getters and Setters
    public double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(double walletBalance) { this.walletBalance = walletBalance; }
}
