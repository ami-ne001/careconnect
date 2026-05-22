package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.client.PatientServiceClient;
import com.careconnect.clinicalservice.dto.*;
import com.careconnect.clinicalservice.entity.*;
import com.careconnect.clinicalservice.enums.*;
import com.careconnect.clinicalservice.exception.BadRequestException;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.messaging.EventPublisher;
import com.careconnect.clinicalservice.messaging.SurgeryScheduledEvent;
import com.careconnect.clinicalservice.repository.*;
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
public class SurgeryService {

    private final SurgeryRepository surgeryRepository;
    private final OperatingRoomRepository operatingRoomRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final CareTaskRepository careTaskRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthServiceClient authServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final EventPublisher eventPublisher;

    @Transactional
    public SurgeryResponse scheduleSurgery(SurgeryCreateRequest request, Long schedulerUserId) {
        log.info("Scheduling surgery for patient ID: {}", request.getPatientId());

        // Verify patient exists
        try {
            PatientResponse patient = patientServiceClient.getPatientById(request.getPatientId());
            if (patient == null) {
                throw new BadRequestException("Patient not found with ID: " + request.getPatientId());
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify patient with ID " + request.getPatientId() + ": " + e.getMessage());
        }

        // Verify lead surgeon exists and is a surgeon
        DoctorProfile leadSurgeon = doctorProfileRepository.findByUserId(request.getLeadSurgeonId())
                .orElseThrow(() -> new BadRequestException("Lead surgeon profile not found for ID: " + request.getLeadSurgeonId()));
        if (!Boolean.TRUE.equals(leadSurgeon.getIsSurgeon())) {
            throw new BadRequestException("Lead surgeon with ID " + request.getLeadSurgeonId() + " is not registered as a surgeon");
        }

        // Verify assisting surgeon if provided
        if (request.getAssistingSurgeonId() != null) {
            DoctorProfile assistSurgeon = doctorProfileRepository.findByUserId(request.getAssistingSurgeonId())
                    .orElseThrow(() -> new BadRequestException("Assisting surgeon profile not found for ID: " + request.getAssistingSurgeonId()));
            if (!Boolean.TRUE.equals(assistSurgeon.getIsSurgeon())) {
                throw new BadRequestException("Assisting surgeon with ID " + request.getAssistingSurgeonId() + " is not registered as a surgeon");
            }
        }

        // Verify assisting nurse if provided
        if (request.getAssistingNurseId() != null) {
            try {
                UserSummaryResponse nurse = authServiceClient.getUserSummary(request.getAssistingNurseId());
                if (!"NURSE".equalsIgnoreCase(nurse.getRole())) {
                    throw new BadRequestException("Assisting staff with ID " + request.getAssistingNurseId() + " is not a nurse");
                }
            } catch (Exception e) {
                throw new BadRequestException("Failed to verify assisting nurse with ID " + request.getAssistingNurseId() + ": " + e.getMessage());
            }
        }

        // Verify operating room exists and is AVAILABLE
        OperatingRoom operatingRoom = operatingRoomRepository.findById(request.getOperatingRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Operating Room not found with id: " + request.getOperatingRoomId()));
        if (operatingRoom.getStatus() != OperatingRoomStatus.AVAILABLE) {
            throw new BadRequestException("Operating room " + operatingRoom.getName() + " is not available. Status: " + operatingRoom.getStatus());
        }

        Surgery surgery = Surgery.builder()
                .patientId(request.getPatientId())
                .leadSurgeonId(request.getLeadSurgeonId())
                .assistingSurgeonId(request.getAssistingSurgeonId())
                .assistingNurseId(request.getAssistingNurseId())
                .operatingRoom(operatingRoom)
                .admissionId(request.getAdmissionId())
                .surgeryType(request.getSurgeryType())
                .priority(request.getPriority() != null ? request.getPriority() : SurgeryPriority.ELECTIVE)
                .status(SurgeryStatus.SCHEDULED)
                .scheduledAt(request.getScheduledAt())
                .estimatedDuration(request.getEstimatedDuration() != null ? request.getEstimatedDuration() : 60)
                .preOpNotes(request.getPreOpNotes())
                .specialEquipment(request.getSpecialEquipment())
                .build();

        Surgery saved = surgeryRepository.save(surgery);

        // Create default pre-op care tasks for the nurse
        CareTask preOpTask = CareTask.builder()
                .patientId(saved.getPatientId())
                .assignedTo(saved.getAssistingNurseId() != null ? saved.getAssistingNurseId() : 2L) // Assign to assisting nurse or default nurse
                .surgery(saved)
                .admissionId(saved.getAdmissionId())
                .title("Pre-op Preparation Checklist")
                .description("Verify NPO status, patient identity band, and consent forms for surgery: " + saved.getSurgeryType())
                .priority(TaskPriority.URGENT)
                .status(TaskStatus.TODO)
                .dueAt(saved.getScheduledAt().minusHours(2))
                .build();
        careTaskRepository.save(preOpTask);

        // Publish Event
        SurgeryScheduledEvent event = SurgeryScheduledEvent.builder()
                .surgeryId(saved.getId())
                .patientId(saved.getPatientId())
                .leadSurgeonId(saved.getLeadSurgeonId())
                .operatingRoomId(saved.getOperatingRoom().getId())
                .scheduledTime(saved.getScheduledAt())
                .priority(saved.getPriority().name())
                .build();
        eventPublisher.publishSurgeryScheduled(event);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(schedulerUserId)
                .action(AuditAction.CREATE)
                .module("SURGERY")
                .description("Scheduled surgery ID: " + saved.getId() + " type: " + saved.getSurgeryType())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public SurgeryResponse getSurgeryById(Long id) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Surgery not found with id: " + id));
        return mapToResponse(surgery);
    }

    @Transactional(readOnly = true)
    public List<SurgeryResponse> getSurgeriesByPatient(Long patientId) {
        return surgeryRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SurgeryResponse> getSurgeriesByLeadSurgeon(Long surgeonId) {
        return surgeryRepository.findByLeadSurgeonId(surgeonId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SurgeryResponse updateSurgery(Long id, SurgeryUpdateRequest request, Long updaterUserId) {
        log.info("Updating surgery ID: {}", id);
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Surgery not found with id: " + id));

        if (request.getAssistingSurgeonId() != null) {
            DoctorProfile assistSurgeon = doctorProfileRepository.findByUserId(request.getAssistingSurgeonId())
                    .orElseThrow(() -> new BadRequestException("Assisting surgeon profile not found"));
            if (!Boolean.TRUE.equals(assistSurgeon.getIsSurgeon())) {
                throw new BadRequestException("Assisting surgeon must be a registered surgeon");
            }
            surgery.setAssistingSurgeonId(request.getAssistingSurgeonId());
        }

        if (request.getAssistingNurseId() != null) {
            surgery.setAssistingNurseId(request.getAssistingNurseId());
        }

        if (request.getOperatingRoomId() != null && !surgery.getOperatingRoom().getId().equals(request.getOperatingRoomId())) {
            OperatingRoom room = operatingRoomRepository.findById(request.getOperatingRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Operating Room not found"));
            if (room.getStatus() != OperatingRoomStatus.AVAILABLE) {
                throw new BadRequestException("New operating room is not available");
            }
            surgery.setOperatingRoom(room);
        }

        if (request.getAdmissionId() != null) {
            surgery.setAdmissionId(request.getAdmissionId());
        }
        if (request.getSurgeryType() != null) {
            surgery.setSurgeryType(request.getSurgeryType());
        }
        if (request.getPriority() != null) {
            surgery.setPriority(request.getPriority());
        }
        if (request.getEstimatedDuration() != null) {
            surgery.setEstimatedDuration(request.getEstimatedDuration());
        }
        if (request.getScheduledAt() != null) {
            surgery.setScheduledAt(request.getScheduledAt());
        }
        if (request.getPreOpNotes() != null) {
            surgery.setPreOpNotes(request.getPreOpNotes());
        }
        if (request.getSpecialEquipment() != null) {
            surgery.setSpecialEquipment(request.getSpecialEquipment());
        }

        if (request.getStatus() != null && request.getStatus() != surgery.getStatus()) {
            updateSurgeryStatusInternal(surgery, request.getStatus());
        }

        if (request.getOutcome() != null) {
            surgery.setOutcome(request.getOutcome());
        }
        if (request.getPostOpNotes() != null) {
            surgery.setPostOpNotes(request.getPostOpNotes());
        }

        Surgery saved = surgeryRepository.save(surgery);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(updaterUserId)
                .action(AuditAction.UPDATE)
                .module("SURGERY")
                .description("Updated surgery ID: " + saved.getId() + " status: " + saved.getStatus())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional
    public SurgeryResponse addPostOpNotes(Long id, PostOpNotesRequest request, Long surgeonId) {
        log.info("Adding post-op notes for surgery ID: {}", id);
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Surgery not found with id: " + id));

        if (!surgery.getLeadSurgeonId().equals(surgeonId)) {
            throw new BadRequestException("Only the lead surgeon can record post-op notes");
        }

        surgery.setPostOpNotes(request.getPostOpNotes());
        surgery.setOutcome(request.getOutcome());
        if (surgery.getStatus() == SurgeryStatus.IN_PROGRESS || surgery.getStatus() == SurgeryStatus.POST_OP) {
            updateSurgeryStatusInternal(surgery, SurgeryStatus.COMPLETED);
        }

        Surgery saved = surgeryRepository.save(surgery);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(surgeonId)
                .action(AuditAction.UPDATE)
                .module("SURGERY")
                .description("Added post-op notes for surgery ID: " + saved.getId() + " outcome: " + saved.getOutcome())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    private void updateSurgeryStatusInternal(Surgery surgery, SurgeryStatus newStatus) {
        surgery.setStatus(newStatus);
        OperatingRoom room = surgery.getOperatingRoom();

        if (newStatus == SurgeryStatus.IN_PROGRESS) {
            surgery.setActualStartAt(LocalDateTime.now());
            room.setStatus(OperatingRoomStatus.IN_USE);
            room.setLastUsedAt(LocalDateTime.now());
        } else if (newStatus == SurgeryStatus.COMPLETED) {
            surgery.setActualEndAt(LocalDateTime.now());
            room.setStatus(OperatingRoomStatus.CLEANING);
        } else if (newStatus == SurgeryStatus.CANCELLED) {
            room.setStatus(OperatingRoomStatus.AVAILABLE);
        } else if (newStatus == SurgeryStatus.POST_OP) {
            room.setStatus(OperatingRoomStatus.CLEANING);
        }
        operatingRoomRepository.save(room);
    }

    private SurgeryResponse mapToResponse(Surgery s) {
        return SurgeryResponse.builder()
                .id(s.getId())
                .patientId(s.getPatientId())
                .leadSurgeonId(s.getLeadSurgeonId())
                .assistingSurgeonId(s.getAssistingSurgeonId())
                .assistingNurseId(s.getAssistingNurseId())
                .operatingRoomId(s.getOperatingRoom().getId())
                .operatingRoomName(s.getOperatingRoom().getName())
                .admissionId(s.getAdmissionId())
                .surgeryType(s.getSurgeryType())
                .priority(s.getPriority())
                .status(s.getStatus())
                .scheduledAt(s.getScheduledAt())
                .estimatedDuration(s.getEstimatedDuration())
                .actualStartAt(s.getActualStartAt())
                .actualEndAt(s.getActualEndAt())
                .preOpNotes(s.getPreOpNotes())
                .postOpNotes(s.getPostOpNotes())
                .outcome(s.getOutcome())
                .specialEquipment(s.getSpecialEquipment())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
