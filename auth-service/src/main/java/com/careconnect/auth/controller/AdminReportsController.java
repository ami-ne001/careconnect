package com.careconnect.auth.controller;

import com.careconnect.auth.dto.StaffByDepartmentReportResponse;
import com.careconnect.auth.service.AdminReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    private final AdminReportsService adminReportsService;

    @GetMapping("/staff-by-department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffByDepartmentReportResponse> getStaffByDepartment() {
        return ResponseEntity.ok(adminReportsService.getStaffByDepartment());
    }
}
