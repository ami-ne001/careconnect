package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.SurgeryOutcome;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostOpNotesRequest {
    @NotNull(message = "Post-op notes are required")
    private String postOpNotes;

    @NotNull(message = "Surgery outcome is required")
    private SurgeryOutcome outcome;
}
