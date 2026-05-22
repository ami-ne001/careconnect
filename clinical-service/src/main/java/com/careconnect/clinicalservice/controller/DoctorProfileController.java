package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.DoctorProfileResponse;
import com.careconnect.clinicalservice.dto.DoctorProfileUpdateRequest;
import com.careconnect.clinicalservice.service.DoctorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clinical/doctors")
@RequiredArgsConstructor
public class DoctorProfileController {

    private final DoctorProfileService doctorProfileService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<DoctorProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorProfileService.getProfileByUserId(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DoctorProfileResponse> updateProfile(@PathVariable Long userId, 
                                                               @RequestBody DoctorProfileUpdateRequest request) {
        return ResponseEntity.ok(doctorProfileService.createOrUpdateProfile(userId, request));
    }
}
