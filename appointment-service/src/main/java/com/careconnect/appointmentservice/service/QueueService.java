package com.careconnect.appointmentservice.service;

import com.careconnect.appointmentservice.dto.QueueResponse;
import com.careconnect.appointmentservice.dto.QueueStatusUpdateRequest;
import com.careconnect.appointmentservice.entity.Appointment;
import com.careconnect.appointmentservice.entity.Queue;
import com.careconnect.appointmentservice.enums.AppointmentStatus;
import com.careconnect.appointmentservice.enums.QueueStatus;
import com.careconnect.appointmentservice.exception.BadRequestException;
import com.careconnect.appointmentservice.exception.ResourceNotFoundException;
import com.careconnect.appointmentservice.repository.AppointmentRepository;
import com.careconnect.appointmentservice.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueRepository queueRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public QueueResponse checkIn(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Appointment must be in SCHEDULED or CONFIRMED status to check in");
        }

        if (queueRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new BadRequestException("Appointment is already checked in");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        Integer maxTicket = queueRepository.findMaxTicketNumberForDate(startOfDay, endOfDay);
        int nextTicket = (maxTicket == null) ? 1 : maxTicket + 1;

        Queue queue = Queue.builder()
                .appointment(appointment)
                .ticketNumber(nextTicket)
                .status(QueueStatus.WAITING)
                .build();

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointmentRepository.save(appointment);

        return mapToResponse(queueRepository.save(queue));
    }

    @Transactional
    public QueueResponse callNext(Long queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found with id: " + queueId));

        if (queue.getStatus() != QueueStatus.WAITING) {
            throw new BadRequestException("Queue entry is not in WAITING status");
        }

        // Set to CALLED first — patient is being paged/called to the room
        queue.setStatus(QueueStatus.CALLED);
        queue.setCalledAt(LocalDateTime.now());

        return mapToResponse(queueRepository.save(queue));
    }

    @Transactional
    public QueueResponse updateQueueStatus(Long id, QueueStatusUpdateRequest request) {
        Queue queue = queueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found with id: " + id));

        queue.setStatus(request.getStatus());

        if (request.getStatus() == QueueStatus.CALLED && queue.getCalledAt() == null) {
            queue.setCalledAt(LocalDateTime.now());
        }

        Appointment appointment = queue.getAppointment();
        if (request.getStatus() == QueueStatus.IN_ROOM) {
            // Patient physically enters the room → appointment goes IN_PROGRESS
            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            appointmentRepository.save(appointment);
        } else if (request.getStatus() == QueueStatus.DONE) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        return mapToResponse(queueRepository.save(queue));
    }

    public List<QueueResponse> getTodayQueue() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        return queueRepository.findTodayQueue(startOfDay, endOfDay).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QueueResponse> getQueueByStatus(QueueStatus status) {
        return queueRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QueueResponse mapToResponse(Queue queue) {
        return QueueResponse.builder()
                .id(queue.getId())
                .appointmentId(queue.getAppointment().getId())
                .ticketNumber(queue.getTicketNumber())
                .checkedInAt(queue.getCheckedInAt())
                .calledAt(queue.getCalledAt())
                .status(queue.getStatus())
                .build();
    }
}
