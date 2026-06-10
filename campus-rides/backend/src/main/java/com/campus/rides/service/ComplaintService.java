package com.campus.rides.service;

import com.campus.rides.dto.ComplaintRequest;
import com.campus.rides.entity.Complaint;
import java.util.List;

public interface ComplaintService {
    Complaint createComplaint(String username, ComplaintRequest request);
    List<Complaint> getReporterComplaints(String username);
}
