package com.careconnect.appointmentservice.controller;

import com.careconnect.appointmentservice.dto.DoctorUnavailabilityRequest;
import com.careconnect.appointmentservice.dto.DoctorUnavailabilityResponse;
import com.careconnect.appointmentservice.exception.BadRequestException;
import com.careconnect.appointmentservice.service.DoctorUnavailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unavailability")
@RequiredArgsConstructor
public class DoctorUnavailabilityController {

    private final DoctorUnavailabilityService unavailabilityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorUnavailabilityResponse> addUnavailability(
            @RequestParam(value = "doctorId", required = false) Long doctorId,
            @Valid @RequestBody DoctorUnavailabilityRequest request,
            Authentication authentication) {
        
        Long targetDoctorId = doctorId;
        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        
        if (isDoctor) {
            targetDoctorId = Long.valueOf(authentication.getName());
        } else if (targetDoctorId == null) {
            throw new BadRequestException("Doctor ID is required for non-doctor users");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(unavailabilityService.addUnavailability(targetDoctorId, request));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<List<DoctorUnavailabilityResponse>> getUnavailabilityByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(unavailabilityService.getUnavailabilityByDoctor(doctorId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deleteUnavailability(@PathVariable Long id) {
        unavailabilityService.deleteUnavailability(id);
        return ResponseEntity.noContent().build();
    }
}
