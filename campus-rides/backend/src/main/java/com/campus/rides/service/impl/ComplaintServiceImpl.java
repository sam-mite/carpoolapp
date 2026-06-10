package com.campus.rides.service.impl;

import com.campus.rides.dto.ComplaintRequest;
import com.campus.rides.entity.Complaint;
import com.campus.rides.entity.Ride;
import com.campus.rides.entity.User;
import com.campus.rides.repository.ComplaintRepository;
import com.campus.rides.repository.RideRepository;
import com.campus.rides.repository.UserRepository;
import com.campus.rides.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Override
    public Complaint createComplaint(String username, ComplaintRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Reporter user not found!"));

        Ride ride = null;
        if (request.getRideId() != null) {
            ride = rideRepository.findById(request.getRideId()).orElse(null);
        }

        Complaint complaint = new Complaint(user, ride, request.getTitle(), request.getDescription());
        return complaintRepository.save(complaint);
    }

    @Override
    public List<Complaint> getReporterComplaints(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return complaintRepository.findByReporterIdOrderByCreatedAtDesc(user.getId());
    }
}
