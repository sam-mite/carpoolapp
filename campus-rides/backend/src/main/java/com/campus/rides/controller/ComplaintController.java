package com.campus.rides.controller;

import com.campus.rides.dto.ComplaintRequest;
import com.campus.rides.entity.Complaint;
import com.campus.rides.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaint Ticketing API", description = "Endpoints for passengers and drivers to log complaints and support tickets.")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "File a support complaint", description = "Submits a complaint ticket regarding a ride, driver, passenger, or billing discrepancy.")
    public ResponseEntity<Complaint> fileComplaint(@Valid @RequestBody ComplaintRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Complaint complaint = complaintService.createComplaint(username, request);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/passenger")
    @Operation(summary = "Get user's logged complaints", description = "Fetches a historical list of tickets reported by the currently authenticated user.")
    public ResponseEntity<List<Complaint>> getUserComplaints() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Complaint> complaints = complaintService.getReporterComplaints(username);
        return ResponseEntity.ok(complaints);
    }
}
