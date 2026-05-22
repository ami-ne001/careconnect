package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.dto.CareTaskCreateRequest;
import com.careconnect.clinicalservice.dto.CareTaskResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.entity.CareTask;
import com.careconnect.clinicalservice.entity.Surgery;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.enums.TaskPriority;
import com.careconnect.clinicalservice.enums.TaskStatus;
import com.careconnect.clinicalservice.exception.BadRequestException;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import com.careconnect.clinicalservice.repository.CareTaskRepository;
import com.careconnect.clinicalservice.repository.SurgeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareTaskService {

    private final CareTaskRepository careTaskRepository;
    private final SurgeryRepository surgeryRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public CareTaskResponse createCareTask(CareTaskCreateRequest request, Long creatorUserId) {
        log.info("Creating care task for patient ID: {}", request.getPatientId());

        Surgery surgery = null;
        if (request.getSurgeryId() != null) {
            surgery = surgeryRepository.findById(request.getSurgeryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Surgery not found with id: " + request.getSurgeryId()));
        }

        CareTask task = CareTask.builder()
                .patientId(request.getPatientId())
                .assignedTo(request.getAssignedTo())
                .surgery(surgery)
                .admissionId(request.getAdmissionId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.NORMAL)
                .status(TaskStatus.TODO)
                .dueAt(request.getDueAt())
                .build();

        CareTask saved = careTaskRepository.save(task);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(creatorUserId)
                .action(AuditAction.CREATE)
                .module("CARE_TASKS")
                .description("Created care task ID: " + saved.getId() + " title: " + saved.getTitle())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public CareTaskResponse getCareTaskById(Long id) {
        CareTask task = careTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care task not found with id: " + id));
        return mapToResponse(task);
    }

    @Transactional(readOnly = true)
    public List<CareTaskResponse> getTasksAssignedTo(Long nurseId) {
        return careTaskRepository.findByAssignedTo(nurseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CareTaskResponse> getTasksByPatient(Long patientId) {
        return careTaskRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareTaskResponse updateTaskStatus(Long id, TaskStatus status, Long nurseId) {
        log.info("Updating status of care task ID: {} to {}", id, status);
        CareTask task = careTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care task not found with id: " + id));

        // Let any nurse update it or only the assigned one? We should allow any authorized user, but log the actor.
        task.setStatus(status);
        CareTask saved = careTaskRepository.save(task);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(nurseId)
                .action(AuditAction.UPDATE)
                .module("CARE_TASKS")
                .description("Updated status of care task ID: " + saved.getId() + " to " + saved.getStatus())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    private CareTaskResponse mapToResponse(CareTask t) {
        return CareTaskResponse.builder()
                .id(t.getId())
                .patientId(t.getPatientId())
                .assignedTo(t.getAssignedTo())
                .surgeryId(t.getSurgery() != null ? t.getSurgery().getId() : null)
                .admissionId(t.getAdmissionId())
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .dueAt(t.getDueAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
