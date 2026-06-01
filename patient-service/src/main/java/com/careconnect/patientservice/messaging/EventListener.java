package com.careconnect.patientservice.messaging;

import com.careconnect.patientservice.entity.Notification;
import com.careconnect.patientservice.entity.PatientProfile;
import com.careconnect.patientservice.enums.NotificationType;
import com.careconnect.patientservice.repository.NotificationRepository;
import com.careconnect.patientservice.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventListener {

    private final PatientProfileRepository patientProfileRepository;
    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_CONFIRMED_QUEUE)
    public void handleAppointmentConfirmed(AppointmentConfirmedEvent event) {
        log.info("Received AppointmentConfirmedEvent: {}", event);
        try {
            PatientProfile profile = patientProfileRepository.findByUserId(event.getPatientId()).orElse(null);
            if (profile != null) {
                Notification notification = Notification.builder()
                        .userId(profile.getUserId())
                        .type(NotificationType.APPOINTMENT_REMINDER)
                        .title("Appointment Confirmed")
                        .message("Your appointment on " + event.getScheduledAt() + " has been confirmed.")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
                log.info("Notification created for user ID: {} regarding appointment ID: {}", profile.getUserId(), event.getAppointmentId());
            } else {
                log.warn("Patient profile not found for user ID: {}, cannot send appointment notification", event.getPatientId());
            }
        } catch (Exception e) {
            log.error("Error processing AppointmentConfirmedEvent: ", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.SURGERY_SCHEDULED_QUEUE)
    public void handleSurgeryScheduled(SurgeryScheduledEvent event) {
        log.info("Received SurgeryScheduledEvent: {}", event);
        try {
            PatientProfile profile = patientProfileRepository.findById(event.getPatientId()).orElse(null);
            if (profile != null) {
                Notification notification = Notification.builder()
                        .userId(profile.getUserId())
                        .type(NotificationType.SURGERY_SCHEDULED)
                        .title("Surgery Scheduled")
                        .message("A surgery has been scheduled for you on " + event.getScheduledTime() + " with priority: " + event.getPriority())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
                log.info("Notification created for user ID: {} regarding surgery ID: {}", profile.getUserId(), event.getSurgeryId());
            } else {
                log.warn("Patient profile not found for ID: {}, cannot send surgery notification", event.getPatientId());
            }
        } catch (Exception e) {
            log.error("Error processing SurgeryScheduledEvent: ", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.LAB_RESULT_UPLOADED_QUEUE)
    public void handleLabResultUploaded(LabResultUploadedEvent event) {
        log.info("Received LabResultUploadedEvent: {}", event);
        try {
            PatientProfile profile = patientProfileRepository.findById(event.getPatientId()).orElse(null);
            if (profile != null) {
                Notification notification = Notification.builder()
                        .userId(profile.getUserId())
                        .type(NotificationType.LAB_RESULT_READY)
                        .title("Lab Result Ready")
                        .message("Your lab test result for request ID " + event.getLabRequestId() + " (" + event.getTestType() + ") is now available.")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
                log.info("Notification created for user ID: {} regarding lab result ID: {}", profile.getUserId(), event.getLabResultId());
            } else {
                log.warn("Patient profile not found for ID: {}, cannot send lab result notification", event.getPatientId());
            }
        } catch (Exception e) {
            log.error("Error processing LabResultUploadedEvent: ", e);
        }
    }
}
