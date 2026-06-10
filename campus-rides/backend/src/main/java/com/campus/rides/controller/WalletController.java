package com.campus.rides.controller;

import com.campus.rides.entity.Passenger;
import com.campus.rides.entity.WalletTransaction;
import com.campus.rides.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallet System API", description = "Endpoints for depositing credits and tracking transaction histories.")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @PostMapping("/deposit")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Top up wallet balance", description = "Simulates credit deposit, increasing the passenger's available funds.")
    public ResponseEntity<Passenger> deposit(@RequestParam double amount) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Passenger passenger = walletService.deposit(username, amount);
        return ResponseEntity.ok(passenger);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('PASSENGER')")
    @Operation(summary = "Get wallet transaction logs", description = "Fetches a historical list of deposits, bookings, and refunds for the passenger.")
    public ResponseEntity<List<WalletTransaction>> getTransactions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WalletTransaction> transactions = walletService.getTransactions(username);
        return ResponseEntity.ok(transactions);
    }
}
