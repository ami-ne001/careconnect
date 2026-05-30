package com.careconnect.labservice.service;

import com.careconnect.labservice.dto.EquipmentCreateRequest;
import com.careconnect.labservice.dto.EquipmentResponse;
import com.careconnect.labservice.dto.MaintenanceCreateRequest;
import com.careconnect.labservice.dto.MaintenanceResponse;
import com.careconnect.labservice.dto.MaintenanceUpdateRequest;
import com.careconnect.labservice.entity.Equipment;
import com.careconnect.labservice.entity.EquipmentMaintenance;
import com.careconnect.labservice.enums.EquipmentStatus;
import com.careconnect.labservice.enums.MaintenanceStatus;
import com.careconnect.labservice.exception.BadRequestException;
import com.careconnect.labservice.exception.ResourceNotFoundException;
import com.careconnect.labservice.repository.EquipmentMaintenanceRepository;
import com.careconnect.labservice.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMaintenanceRepository maintenanceRepository;

    @Transactional
    public EquipmentResponse addEquipment(EquipmentCreateRequest request) {
        log.info("Adding equipment: {}", request.getName());
        if (request.getSerialNumber() != null && equipmentRepository.findBySerialNumber(request.getSerialNumber()).isPresent()) {
            throw new BadRequestException("Equipment with serial number '" + request.getSerialNumber() + "' already exists");
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .type(request.getType())
                .serialNumber(request.getSerialNumber())
                .status(EquipmentStatus.OPERATIONAL)
                .lastCalibrated(request.getLastCalibrated())
                .nextCalibration(request.getNextCalibration())
                .notes(request.getNotes())
                .build();

        return mapToResponse(equipmentRepository.save(equipment));
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        return mapToResponse(equipment);
    }

    @Transactional
    public EquipmentResponse updateEquipmentStatus(Long id, EquipmentStatus status) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        equipment.setStatus(status);
        return mapToResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public MaintenanceResponse reportMaintenance(Long equipmentId, MaintenanceCreateRequest request) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));

        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        EquipmentMaintenance maintenance = EquipmentMaintenance.builder()
                .equipment(equipment)
                .reportedBy(request.getReportedBy())
                .issue(request.getIssue())
                .status(MaintenanceStatus.OPEN)
                .build();

        return mapToResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional
    public MaintenanceResponse resolveMaintenance(Long maintenanceId, MaintenanceUpdateRequest request) {
        EquipmentMaintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + maintenanceId));

        maintenance.setResolution(request.getResolution());
        maintenance.setStatus(request.getStatus());
        
        if (request.getStatus() == MaintenanceStatus.RESOLVED) {
            maintenance.setResolvedAt(LocalDateTime.now());
            Equipment equipment = maintenance.getEquipment();
            equipment.setStatus(EquipmentStatus.OPERATIONAL);
            equipmentRepository.save(equipment);
        }

        return mapToResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId) {
        return maintenanceRepository.findByEquipment_Id(equipmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EquipmentResponse mapToResponse(Equipment entity) {
        return EquipmentResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .serialNumber(entity.getSerialNumber())
                .status(entity.getStatus())
                .lastCalibrated(entity.getLastCalibrated())
                .nextCalibration(entity.getNextCalibration())
                .notes(entity.getNotes())
                .build();
    }

    private MaintenanceResponse mapToResponse(EquipmentMaintenance entity) {
        return MaintenanceResponse.builder()
                .id(entity.getId())
                .equipmentId(entity.getEquipment().getId())
                .reportedBy(entity.getReportedBy())
                .issue(entity.getIssue())
                .resolution(entity.getResolution())
                .status(entity.getStatus())
                .reportedAt(entity.getReportedAt())
                .resolvedAt(entity.getResolvedAt())
                .build();
    }
}
