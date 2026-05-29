package com.careconnect.patientservice.controller;

import com.careconnect.patientservice.dto.PatientSummaryResponse;
import com.careconnect.patientservice.service.PatientProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/patients")
@RequiredArgsConstructor
public class InternalPatientController {

    private final PatientProfileService patientProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<PatientSummaryResponse> getPatientSummaryById(@PathVariable Long id) {
        return ResponseEntity.ok(patientProfileService.getPatientSummaryById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PatientSummaryResponse> getPatientSummaryByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(patientProfileService.getPatientSummaryByUserId(userId));
    }
}
