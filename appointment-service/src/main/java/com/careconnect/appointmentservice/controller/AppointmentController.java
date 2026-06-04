package com.careconnect.appointmentservice.controller;

import com.careconnect.appointmentservice.dto.AppointmentCreateRequest;
import com.careconnect.appointmentservice.dto.AppointmentResponse;
import com.careconnect.appointmentservice.dto.AppointmentStatusUpdateRequest;
import com.careconnect.appointmentservice.dto.AppointmentUpdateRequest;
import com.careconnect.appointmentservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentCreateRequest request,
                                                                 Authentication authentication) {
        Long createdByUserId = Long.valueOf(authentication.getName());
        boolean isPatient = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request, createdByUserId, isPatient));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<Page<AppointmentResponse>> getAllAppointments(Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        Long patientId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctorAndDate(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorAndDate(doctorId, date));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<AppointmentResponse> updateAppointment(@PathVariable Long id,
                                                                 @Valid @RequestBody AppointmentUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<AppointmentResponse> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }
}
