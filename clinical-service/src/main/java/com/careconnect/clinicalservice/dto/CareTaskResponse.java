package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.TaskPriority;
import com.careconnect.clinicalservice.enums.TaskStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareTaskResponse {
    private Long id;
    private Long patientId;
    private Long assignedTo;
    private Long surgeryId;
    private Long admissionId;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDateTime dueAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
