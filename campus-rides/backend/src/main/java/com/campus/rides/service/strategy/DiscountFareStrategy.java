package com.campus.rides.service.strategy;

import org.springframework.stereotype.Component;

@Component("discountFareStrategy")
public class DiscountFareStrategy implements FareStrategy {
    @Override
    public double calculateFare(double baseFare) {
        // Base rate with 15% discount
        return baseFare * 0.85;
    }
}
