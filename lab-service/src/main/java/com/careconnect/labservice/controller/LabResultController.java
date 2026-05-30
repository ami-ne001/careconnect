package com.careconnect.labservice.controller;

import com.careconnect.labservice.dto.LabResultCreateRequest;
import com.careconnect.labservice.dto.LabResultResponse;
import com.careconnect.labservice.service.LabResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lab/results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService labResultService;

    @PostMapping
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LabResultResponse> uploadResult(@Valid @RequestBody LabResultCreateRequest request) {
        return ResponseEntity.ok(labResultService.uploadResult(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'LAB_TECHNICIAN', 'PATIENT', 'ADMIN')")
    public ResponseEntity<LabResultResponse> getResultById(@PathVariable Long id) {
        return ResponseEntity.ok(labResultService.getResultById(id));
    }

    @GetMapping("/request/{labRequestId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'LAB_TECHNICIAN', 'PATIENT', 'ADMIN')")
    public ResponseEntity<LabResultResponse> getResultByLabRequestId(@PathVariable Long labRequestId) {
        return ResponseEntity.ok(labResultService.getResultByLabRequestId(labRequestId));
    }
}
