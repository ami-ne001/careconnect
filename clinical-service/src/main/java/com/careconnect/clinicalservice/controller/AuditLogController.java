package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.AuditActivityResponse;
import com.careconnect.clinicalservice.dto.DailyAuditActivityResponse;
import com.careconnect.clinicalservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

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
