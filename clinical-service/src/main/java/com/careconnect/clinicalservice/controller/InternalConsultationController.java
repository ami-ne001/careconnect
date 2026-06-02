package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.ConsultationSummaryResponse;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoints for service-to-service communication.
 * These routes are permitted without JWT (see SecurityConfig: /api/internal/**).
 * They must NEVER be exposed through the API Gateway.
 */
@RestController
@RequestMapping("/api/internal/consultations")
@RequiredArgsConstructor
public class InternalConsultationController {

    private final ConsultationRepository consultationRepository;

    /**
     * Called by lab-service to verify consultation existence and retrieve ownership info
     * before creating a lab request linked to a consultation.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConsultationSummaryResponse> getConsultationSummary(@PathVariable Long id) {
        return consultationRepository.findById(id)
                .map(c -> ResponseEntity.ok(ConsultationSummaryResponse.builder()
                        .id(c.getId())
                        .patientId(c.getPatientId())
                        .doctorId(c.getDoctorId())
                        .status(c.getStatus().name())
                        .build()))
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));
    }
}
