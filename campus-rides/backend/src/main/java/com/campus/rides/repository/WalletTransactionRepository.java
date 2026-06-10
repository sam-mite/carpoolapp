package com.campus.rides.repository;

import com.campus.rides.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);
}
