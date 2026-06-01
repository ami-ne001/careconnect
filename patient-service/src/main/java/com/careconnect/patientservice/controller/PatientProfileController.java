package com.careconnect.patientservice.controller;

import com.careconnect.patientservice.dto.*;
import com.careconnect.patientservice.service.PatientProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientProfileController {

    private final PatientProfileService patientProfileService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientProfileResponse> createPatientProfile(@Valid @RequestBody PatientProfileCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientProfileService.createPatientProfile(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE')")
    public ResponseEntity<Page<PatientProfileResponse>> getAllPatientProfiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(patientProfileService.getAllPatientProfiles(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN')")
    public ResponseEntity<PatientProfileResponse> getPatientProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(patientProfileService.getPatientProfileById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PATIENT')")
    public ResponseEntity<PatientProfileResponse> getPatientProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(patientProfileService.getPatientProfileByUserId(userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<PatientProfileResponse> updatePatientProfile(@PathVariable Long id, @RequestBody PatientProfileUpdateRequest request) {
        return ResponseEntity.ok(patientProfileService.updatePatientProfile(id, request));
    }

    @PostMapping("/{id}/allergies")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<AllergyResponse> addAllergy(@PathVariable Long id, @Valid @RequestBody AllergyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientProfileService.addAllergy(id, request));
    }

    @DeleteMapping("/{id}/allergies/{allergyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> removeAllergy(@PathVariable Long id, @PathVariable Long allergyId) {
        patientProfileService.removeAllergy(id, allergyId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/conditions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ChronicConditionResponse> addChronicCondition(@PathVariable Long id, @Valid @RequestBody ChronicConditionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientProfileService.addChronicCondition(id, request));
    }

    @DeleteMapping("/{id}/conditions/{conditionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> removeChronicCondition(@PathVariable Long id, @PathVariable Long conditionId) {
        patientProfileService.removeChronicCondition(id, conditionId);
        return ResponseEntity.noContent().build();
    }
}
