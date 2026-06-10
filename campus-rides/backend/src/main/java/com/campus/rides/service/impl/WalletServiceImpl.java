package com.campus.rides.service.impl;

import com.campus.rides.entity.Passenger;
import com.campus.rides.entity.TransactionType;
import com.campus.rides.entity.User;
import com.campus.rides.entity.WalletTransaction;
import com.campus.rides.repository.PassengerRepository;
import com.campus.rides.repository.UserRepository;
import com.campus.rides.repository.WalletTransactionRepository;
import com.campus.rides.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WalletServiceImpl implements WalletService {

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public Passenger deposit(String passengerUsername, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero!");
        }

        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Passenger passenger = passengerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Logged in user is not a Passenger!"));

        // Add balance
        passenger.setWalletBalance(passenger.getWalletBalance() + amount);
        Passenger updatedPassenger = passengerRepository.save(passenger);

        // Log transaction
        WalletTransaction txn = new WalletTransaction(
                passenger,
                amount,
                TransactionType.DEPOSIT,
                "Topped up wallet balance via stripe"
        );
        walletTransactionRepository.save(txn);

        return updatedPassenger;
    }

    @Override
    public List<WalletTransaction> getTransactions(String passengerUsername) {
        User user = userRepository.findByUsername(passengerUsername)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return walletTransactionRepository.findByPassengerIdOrderByCreatedAtDesc(user.getId());
    }
}
