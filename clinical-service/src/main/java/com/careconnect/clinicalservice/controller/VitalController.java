package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.VitalsCreateRequest;
import com.careconnect.clinicalservice.dto.VitalsResponse;
import com.careconnect.clinicalservice.service.VitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/vitals")
@RequiredArgsConstructor
public class VitalController {

    private final VitalService vitalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE')")
    public ResponseEntity<VitalsResponse> recordVitals(@Valid @RequestBody VitalsCreateRequest request, 
                                                       Authentication authentication) {
        Long recordedBy = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(vitalService.recordVitals(request, recordedBy));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<VitalsResponse>> getVitalsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(vitalService.getVitalsByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/latest")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<VitalsResponse> getLatestVitalsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(vitalService.getLatestVitalsByPatient(patientId));
    }
}
