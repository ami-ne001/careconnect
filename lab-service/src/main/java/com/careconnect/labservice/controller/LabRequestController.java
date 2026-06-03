package com.careconnect.labservice.controller;

import com.careconnect.labservice.dto.LabRequestCreateRequest;
import com.careconnect.labservice.dto.LabRequestResponse;
import com.careconnect.labservice.dto.LabRequestStatusUpdateRequest;
import com.careconnect.labservice.service.LabRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab/requests")
@RequiredArgsConstructor
public class LabRequestController {

    private final LabRequestService labRequestService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<LabRequestResponse> createLabRequest(@Valid @RequestBody LabRequestCreateRequest request) {
        return ResponseEntity.ok(labRequestService.createLabRequest(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<LabRequestResponse> getLabRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(labRequestService.getLabRequestById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<LabRequestResponse>> getAllLabRequests() {
        return ResponseEntity.ok(labRequestService.getAllLabRequests());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'PATIENT', 'ADMIN')")
    public ResponseEntity<List<LabRequestResponse>> getLabRequestsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(labRequestService.getLabRequestsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<LabRequestResponse>> getLabRequestsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(labRequestService.getLabRequestsByDoctor(doctorId));
    }

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<LabRequestResponse>> getLabRequestsByConsultation(@PathVariable Long consultationId) {
        return ResponseEntity.ok(labRequestService.getLabRequestsByConsultation(consultationId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<LabRequestResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody LabRequestStatusUpdateRequest request) {
        return ResponseEntity.ok(labRequestService.updateStatus(id, request.getStatus()));
    }
}
