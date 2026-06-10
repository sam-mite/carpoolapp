package com.campus.rides.service.strategy;

import org.springframework.stereotype.Component;

@Component("surgeFareStrategy")
public class SurgeFareStrategy implements FareStrategy {
    @Override
    public double calculateFare(double baseFare) {
        // Base rate with 30% surge multiplier
        return baseFare * 1.3;
    }
}
