package com.campus.rides.service;

import com.campus.rides.dto.AuthRequest;
import com.campus.rides.dto.AuthResponse;
import com.campus.rides.dto.SignupRequest;

public interface AuthService {
    AuthResponse login(AuthRequest authRequest);
    void signup(SignupRequest signupRequest);
}
