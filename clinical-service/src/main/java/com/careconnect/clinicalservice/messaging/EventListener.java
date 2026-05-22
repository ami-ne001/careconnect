package com.careconnect.clinicalservice.messaging;

import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.entity.CareTask;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.enums.TaskPriority;
import com.careconnect.clinicalservice.enums.TaskStatus;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import com.careconnect.clinicalservice.repository.CareTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventListener {

    private final CareTaskRepository careTaskRepository;
    private final AuditLogRepository auditLogRepository;

    @RabbitListener(queues = RabbitMQConfig.PATIENT_ADMITTED_QUEUE)
    public void handlePatientAdmitted(PatientAdmittedEvent event) {
        log.info("Received PatientAdmittedEvent: {}", event);
        try {
            // Automatically create care tasks for the nurse
            // 1. Initial Vitals
            CareTask vitalsTask = CareTask.builder()
                    .patientId(event.getPatientId())
                    .assignedTo(2L) // Assign to default nurse/staff ID 2 (which is typical for seeding/nurse role in CareConnect)
                    .admissionId(event.getAdmissionId())
                    .title("Initial Vitals")
                    .description("Record blood pressure, heart rate, temperature, and SpO2 for the admitted patient.")
                    .priority(TaskPriority.HIGH)
                    .status(TaskStatus.TODO)
                    .dueAt(LocalDateTime.now().plusHours(1))
                    .build();
            careTaskRepository.save(vitalsTask);

            // 2. Intake Checklist
            CareTask checklistTask = CareTask.builder()
                    .patientId(event.getPatientId())
                    .assignedTo(2L)
                    .admissionId(event.getAdmissionId())
                    .title("Intake Checklist")
                    .description("Verify patient ID, consent forms, and perform initial assessment in room " + event.getRoomNumber() + " (" + event.getWardName() + ").")
                    .priority(TaskPriority.NORMAL)
                    .status(TaskStatus.TODO)
                    .dueAt(LocalDateTime.now().plusHours(2))
                    .build();
            careTaskRepository.save(checklistTask);

            log.info("Successfully created default admission care tasks for patient ID: {}", event.getPatientId());
        } catch (Exception e) {
            log.error("Error processing PatientAdmittedEvent: ", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.LAB_RESULT_UPLOADED_QUEUE)
    public void handleLabResultUploaded(LabResultUploadedEvent event) {
        log.info("Received LabResultUploadedEvent: {}", event);
        try {
            // Log an audit trail for the uploaded lab result
            AuditLog auditLog = AuditLog.builder()
                    .userId(1L) // System/Default admin user
                    .action(AuditAction.CREATE)
                    .module("LAB_RESULT")
                    .description("Lab result uploaded for patient " + event.getPatientId() + ". Request ID: " + event.getLabRequestId() + ", Result ID: " + event.getLabResultId() + ", Test Type: " + event.getTestType())
                    .ipAddress("127.0.0.1")
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Successfully logged audit trail for uploaded lab result ID: {}", event.getLabResultId());
        } catch (Exception e) {
            log.error("Error processing LabResultUploadedEvent: ", e);
        }
    }
}
