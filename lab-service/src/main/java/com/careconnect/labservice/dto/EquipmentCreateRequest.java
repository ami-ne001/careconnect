package com.careconnect.labservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCreateRequest {
    @NotBlank(message = "Equipment name is required")
    private String name;

    private String type;
    private String serialNumber;
    private LocalDate lastCalibrated;
    private LocalDate nextCalibration;
    private String notes;
}
