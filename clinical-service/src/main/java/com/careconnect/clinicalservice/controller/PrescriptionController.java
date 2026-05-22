package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.PrescriptionCreateRequest;
import com.careconnect.clinicalservice.dto.PrescriptionResponse;
import com.careconnect.clinicalservice.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(@Valid @RequestBody PrescriptionCreateRequest request, 
                                                                   Authentication authentication) {
        Long doctorId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(prescriptionService.createPrescription(request, doctorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<PrescriptionResponse> getPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> cancelPrescription(@PathVariable Long id, 
                                                                   Authentication authentication) {
        Long doctorId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(prescriptionService.cancelPrescription(id, doctorId));
    }
}
