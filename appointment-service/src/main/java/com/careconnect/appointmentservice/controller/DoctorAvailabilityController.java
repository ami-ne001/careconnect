package com.careconnect.appointmentservice.controller;

import com.careconnect.appointmentservice.dto.AvailableSlotResponse;
import com.careconnect.appointmentservice.dto.AvailableSlotsRequest;
import com.careconnect.appointmentservice.dto.DoctorAvailabilityRequest;
import com.careconnect.appointmentservice.dto.DoctorAvailabilityResponse;
import com.careconnect.appointmentservice.exception.BadRequestException;
import com.careconnect.appointmentservice.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorAvailabilityResponse> setAvailability(
            @RequestParam(value = "doctorId", required = false) Long doctorId,
            @Valid @RequestBody DoctorAvailabilityRequest request,
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
                .body(availabilityService.setAvailability(targetDoctorId, request));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<List<DoctorAvailabilityResponse>> getAvailabilityByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityByDoctor(doctorId));
    }

    @GetMapping("/slots")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Integer durationMinutes) {
        
        AvailableSlotsRequest request = AvailableSlotsRequest.builder()
                .doctorId(doctorId)
                .date(date)
                .durationMinutes(durationMinutes)
                .build();
        
        return ResponseEntity.ok(availabilityService.getAvailableSlots(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.noContent().build();
    }
}
