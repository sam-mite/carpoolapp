package com.campus.rides.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "drivers")
@PrimaryKeyJoinColumn(name = "user_id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Driver extends User {

    @Column(name = "license_number", nullable = false, length = 50)
    private String licenseNumber;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "cnic_number", length = 20)
    private String cnicNumber;

    @Column(name = "cnic_front_url")
    private String cnicFrontUrl;

    @Column(name = "cnic_back_url")
    private String cnicBackUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @OneToOne(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("driver")
    private Vehicle vehicle;

    // Constructors
    public Driver() {
        super();
    }

    public Driver(String username, String email, String password, String fullName, String phoneNumber, String licenseNumber) {
        super(username, email, password, UserRole.DRIVER, fullName, phoneNumber);
        this.licenseNumber = licenseNumber;
        this.verificationStatus = VerificationStatus.PENDING;
    }

    // Getters and Setters
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { this.isVerified = verified; }

    public String getCnicNumber() { return cnicNumber; }
    public void setCnicNumber(String cnicNumber) { this.cnicNumber = cnicNumber; }

    public String getCnicFrontUrl() { return cnicFrontUrl; }
    public void setCnicFrontUrl(String cnicFrontUrl) { this.cnicFrontUrl = cnicFrontUrl; }

    public String getCnicBackUrl() { return cnicBackUrl; }
    public void setCnicBackUrl(String cnicBackUrl) { this.cnicBackUrl = cnicBackUrl; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
}
