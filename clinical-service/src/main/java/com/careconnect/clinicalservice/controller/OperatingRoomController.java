package com.careconnect.clinicalservice.controller;

import com.careconnect.clinicalservice.dto.OperatingRoomOverviewResponse;
import com.careconnect.clinicalservice.dto.OperatingRoomResponse;
import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import com.careconnect.clinicalservice.service.OperatingRoomAdminService;
import com.careconnect.clinicalservice.service.OperatingRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clinical/operating-rooms")
@RequiredArgsConstructor
public class OperatingRoomController {

    private final OperatingRoomService operatingRoomService;
    private final OperatingRoomAdminService operatingRoomAdminService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<OperatingRoomResponse>> getAllOperatingRooms() {
        return ResponseEntity.ok(operatingRoomService.getAllOperatingRooms());
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<OperatingRoomOverviewResponse> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(operatingRoomAdminService.getOverview(weekStart));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<OperatingRoomResponse> getOperatingRoom(@PathVariable Long id) {
        return ResponseEntity.ok(operatingRoomService.getOperatingRoomById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperatingRoomResponse> createOperatingRoom(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String notes = body.getOrDefault("notes", "");
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Operating room name is required");
        }
        return ResponseEntity.ok(operatingRoomService.createOperatingRoom(name, notes));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<OperatingRoomResponse> updateStatus(@PathVariable Long id, 
                                                              @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        String notes = body.get("notes");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        OperatingRoomStatus status = OperatingRoomStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(operatingRoomService.updateStatus(id, status, notes));
    }
}
