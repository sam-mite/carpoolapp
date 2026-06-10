package com.campus.rides.service.strategy;

import org.springframework.stereotype.Component;

@Component("standardFareStrategy")
public class StandardFareStrategy implements FareStrategy {
    @Override
    public double calculateFare(double baseFare) {
        return baseFare;
    }
}
