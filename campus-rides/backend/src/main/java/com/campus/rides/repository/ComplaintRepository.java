package com.campus.rides.repository;

import com.campus.rides.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
