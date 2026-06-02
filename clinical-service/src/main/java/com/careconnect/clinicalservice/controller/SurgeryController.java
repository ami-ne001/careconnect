package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.PostOpNotesRequest;
import com.careconnect.clinicalservice.dto.SurgeryCreateRequest;
import com.careconnect.clinicalservice.dto.SurgeryResponse;
import com.careconnect.clinicalservice.dto.SurgeryUpdateRequest;
import com.careconnect.clinicalservice.service.SurgeryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/surgeries")
@RequiredArgsConstructor
public class SurgeryController {

    private final SurgeryService surgeryService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<SurgeryResponse> scheduleSurgery(@Valid @RequestBody SurgeryCreateRequest request, 
                                                           Authentication authentication) {
        Long schedulerId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(surgeryService.scheduleSurgery(request, schedulerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<SurgeryResponse> getSurgery(@PathVariable Long id) {
        return ResponseEntity.ok(surgeryService.getSurgeryById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<SurgeryResponse> updateSurgery(@PathVariable Long id, 
                                                         @RequestBody SurgeryUpdateRequest request, 
                                                         Authentication authentication) {
        Long updaterId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(surgeryService.updateSurgery(id, request, updaterId));
    }

    @PutMapping("/{id}/post-op")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<SurgeryResponse> addPostOpNotes(@PathVariable Long id, 
                                                          @Valid @RequestBody PostOpNotesRequest request, 
                                                          Authentication authentication) {
        Long surgeonId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(surgeryService.addPostOpNotes(id, request, surgeonId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<SurgeryResponse>> getSurgeriesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(surgeryService.getSurgeriesByPatient(patientId));
    }

    @GetMapping("/surgeon/{surgeonId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<SurgeryResponse>> getSurgeriesBySurgeon(@PathVariable Long surgeonId) {
        return ResponseEntity.ok(surgeryService.getSurgeriesByLeadSurgeon(surgeonId));
    }

    @GetMapping("/metrics/scheduled-this-month")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getScheduledSurgeriesThisMonth() {
        return ResponseEntity.ok(surgeryService.countScheduledSurgeriesThisMonth());
    }
}
