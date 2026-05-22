package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.TaskPriority;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareTaskCreateRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Nurse assigned ID is required")
    private Long assignedTo;

    private Long surgeryId;
    private Long admissionId;

    @NotNull(message = "Task title is required")
    private String title;

    private String description;
    private TaskPriority priority;
    private LocalDateTime dueAt;
}
