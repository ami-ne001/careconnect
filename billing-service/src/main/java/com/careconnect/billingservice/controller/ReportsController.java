package com.careconnect.billingservice.controller;

import com.careconnect.billingservice.dto.MonthlyRevenueReportResponse;
import com.careconnect.billingservice.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/billing/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/monthly-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MonthlyRevenueReportResponse> getMonthlyRevenue(
            @RequestParam(defaultValue = "6") int months,
            @RequestParam(required = false) String endMonth) {
        YearMonth effectiveEnd = endMonth != null && !endMonth.isBlank()
                ? YearMonth.parse(endMonth)
                : YearMonth.now();
        return ResponseEntity.ok(reportsService.getMonthlyRevenue(months, effectiveEnd));
    }
}
