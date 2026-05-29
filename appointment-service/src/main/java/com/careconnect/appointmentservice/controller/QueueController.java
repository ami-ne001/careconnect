package com.careconnect.appointmentservice.controller;

import com.careconnect.appointmentservice.dto.QueueResponse;
import com.careconnect.appointmentservice.dto.QueueStatusUpdateRequest;
import com.careconnect.appointmentservice.enums.QueueStatus;
import com.careconnect.appointmentservice.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/check-in/{appointmentId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<QueueResponse> checkIn(@PathVariable Long appointmentId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(queueService.checkIn(appointmentId));
    }

    @PutMapping("/{id}/call-next")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<QueueResponse> callNext(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.callNext(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<QueueResponse> updateQueueStatus(@PathVariable Long id,
                                                           @Valid @RequestBody QueueStatusUpdateRequest request) {
        return ResponseEntity.ok(queueService.updateQueueStatus(id, request));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<QueueResponse>> getTodayQueue() {
        return ResponseEntity.ok(queueService.getTodayQueue());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<QueueResponse>> getQueueByStatus(@PathVariable QueueStatus status) {
        return ResponseEntity.ok(queueService.getQueueByStatus(status));
    }
}
