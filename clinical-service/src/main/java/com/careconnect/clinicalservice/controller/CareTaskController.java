package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.CareTaskCreateRequest;
import com.careconnect.clinicalservice.dto.CareTaskResponse;
import com.careconnect.clinicalservice.enums.TaskStatus;
import com.careconnect.clinicalservice.service.CareTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clinical/care-tasks")
@RequiredArgsConstructor
public class CareTaskController {

    private final CareTaskService careTaskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<CareTaskResponse> createCareTask(@Valid @RequestBody CareTaskCreateRequest request, 
                                                           Authentication authentication) {
        Long creatorId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(careTaskService.createCareTask(request, creatorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<CareTaskResponse> getCareTask(@PathVariable Long id) {
        return ResponseEntity.ok(careTaskService.getCareTaskById(id));
    }

    @GetMapping("/nurse/{nurseId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<CareTaskResponse>> getTasksAssignedTo(@PathVariable Long nurseId) {
        return ResponseEntity.ok(careTaskService.getTasksAssignedTo(nurseId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<CareTaskResponse>> getTasksByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(careTaskService.getTasksByPatient(patientId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<CareTaskResponse> updateTaskStatus(@PathVariable Long id, 
                                                             @RequestBody Map<String, String> body, 
                                                             Authentication authentication) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        TaskStatus status = TaskStatus.valueOf(statusStr.toUpperCase());
        Long nurseId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(careTaskService.updateTaskStatus(id, status, nurseId));
    }
}
