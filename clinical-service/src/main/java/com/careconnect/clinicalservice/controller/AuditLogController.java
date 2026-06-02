package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.AuditActivityResponse;
import com.careconnect.clinicalservice.dto.AuditLogPageResponse;
import com.careconnect.clinicalservice.dto.DailyAuditActivityResponse;
import com.careconnect.clinicalservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clinical/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogPageResponse> getAuditLogs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(q, action, startDate, endDate, page, size));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditActivityResponse>> getRecentActivities() {
        return ResponseEntity.ok(auditLogService.getRecentActivities());
    }

    @GetMapping("/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailyAuditActivityResponse>> getDailyAuditActivity() {
        return ResponseEntity.ok(auditLogService.getDailyAuditActivity(30));
    }
}
