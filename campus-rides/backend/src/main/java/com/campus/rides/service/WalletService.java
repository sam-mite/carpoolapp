package com.campus.rides.service;

import com.campus.rides.entity.Passenger;
import com.campus.rides.entity.WalletTransaction;
import java.util.List;

public interface WalletService {
    Passenger deposit(String passengerUsername, double amount);
    List<WalletTransaction> getTransactions(String passengerUsername);
}
