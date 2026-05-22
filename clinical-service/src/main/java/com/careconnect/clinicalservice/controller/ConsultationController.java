package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.ConsultationCreateRequest;
import com.careconnect.clinicalservice.dto.ConsultationResponse;
import com.careconnect.clinicalservice.dto.ConsultationUpdateRequest;
import com.careconnect.clinicalservice.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponse> createConsultation(@Valid @RequestBody ConsultationCreateRequest request) {
        return ResponseEntity.ok(consultationService.createConsultation(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<ConsultationResponse> getConsultation(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponse> updateConsultation(@PathVariable Long id, 
                                                                   @RequestBody ConsultationUpdateRequest request, 
                                                                   Authentication authentication) {
        Long updaterId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(consultationService.updateConsultation(id, request, updaterId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<ConsultationResponse>> getConsultationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.getConsultationsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<ConsultationResponse>> getConsultationsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(consultationService.getConsultationsByDoctor(doctorId));
    }
}
