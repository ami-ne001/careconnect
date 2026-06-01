package com.careconnect.patientservice.controller;

import com.careconnect.patientservice.dto.MedicalDocumentCreateRequest;
import com.careconnect.patientservice.dto.MedicalDocumentResponse;
import com.careconnect.patientservice.service.MedicalDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class MedicalDocumentController {

    private final MedicalDocumentService medicalDocumentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<MedicalDocumentResponse> addDocument(@Valid @RequestBody MedicalDocumentCreateRequest request,
                                                               Authentication authentication) {
        Long uploadedByUserId = Long.valueOf(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalDocumentService.addDocument(request, uploadedByUserId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PATIENT')")
    public ResponseEntity<List<MedicalDocumentResponse>> getDocumentsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalDocumentService.getDocumentsByPatientId(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PATIENT')")
    public ResponseEntity<MedicalDocumentResponse> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalDocumentService.getDocumentById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        medicalDocumentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
