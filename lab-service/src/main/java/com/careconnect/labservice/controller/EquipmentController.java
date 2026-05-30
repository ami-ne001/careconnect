package com.careconnect.labservice.controller;

import com.careconnect.labservice.dto.EquipmentCreateRequest;
import com.careconnect.labservice.dto.EquipmentResponse;
import com.careconnect.labservice.dto.EquipmentStatusUpdateRequest;
import com.careconnect.labservice.dto.MaintenanceCreateRequest;
import com.careconnect.labservice.dto.MaintenanceResponse;
import com.careconnect.labservice.dto.MaintenanceUpdateRequest;
import com.careconnect.labservice.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipmentResponse> addEquipment(@Valid @RequestBody EquipmentCreateRequest request) {
        return ResponseEntity.ok(equipmentService.addEquipment(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<EquipmentResponse>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<EquipmentResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody EquipmentStatusUpdateRequest request) {
        return ResponseEntity.ok(equipmentService.updateEquipmentStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<MaintenanceResponse> reportMaintenance(@PathVariable Long id, @Valid @RequestBody MaintenanceCreateRequest request) {
        if (!id.equals(request.getEquipmentId())) {
            request.setEquipmentId(id);
        }
        return ResponseEntity.ok(equipmentService.reportMaintenance(id, request));
    }

    @GetMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<MaintenanceResponse>> getMaintenanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getMaintenanceByEquipment(id));
    }

    @PatchMapping("/maintenance/{maintenanceId}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<MaintenanceResponse> resolveMaintenance(@PathVariable Long maintenanceId, @Valid @RequestBody MaintenanceUpdateRequest request) {
        return ResponseEntity.ok(equipmentService.resolveMaintenance(maintenanceId, request));
    }
}
