package com.careconnect.patientservice.controller;

import com.careconnect.patientservice.dto.AdmissionCreateRequest;
import com.careconnect.patientservice.dto.AdmissionResponse;
import com.careconnect.patientservice.dto.AdmissionUpdateRequest;
import com.careconnect.patientservice.dto.DischargeRequest;
import com.careconnect.patientservice.service.AdmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<AdmissionResponse> admitPatient(@Valid @RequestBody AdmissionCreateRequest request,
                                                          Authentication authentication) {
        Long receptionistUserId = Long.valueOf(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(admissionService.admitPatient(request, receptionistUserId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<AdmissionResponse>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<AdmissionResponse> getAdmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<List<AdmissionResponse>> getAdmissionsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(admissionService.getAdmissionsByPatientId(patientId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<AdmissionResponse>> getActiveAdmissions() {
        return ResponseEntity.ok(admissionService.getActiveAdmissions());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<AdmissionResponse> updateAdmission(@PathVariable Long id, @RequestBody AdmissionUpdateRequest request) {
        return ResponseEntity.ok(admissionService.updateAdmission(id, request));
    }

    @PostMapping("/{id}/discharge")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ResponseEntity<AdmissionResponse> dischargePatient(@PathVariable Long id, @Valid @RequestBody DischargeRequest request) {
        return ResponseEntity.ok(admissionService.dischargePatient(id, request));
    }
}
