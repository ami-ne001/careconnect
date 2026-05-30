package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferenceRangeCreateRequest {
    @NotNull(message = "Test Type ID is required")
    private Long testTypeId;

    @NotBlank(message = "Component name is required")
    private String component;

    private String unit;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private Gender gender;
    private String notes;
}
