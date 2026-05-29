package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.ConditionOnDischarge;
import com.careconnect.patientservice.enums.DischargeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DischargeRequest {

    @NotNull(message = "Discharge status is required")
    private DischargeStatus dischargeStatus;

    @NotNull(message = "Condition on discharge is required")
    private ConditionOnDischarge conditionOnDischarge;

    private String dischargeNotes;
    private String followUpInstructions;
}
