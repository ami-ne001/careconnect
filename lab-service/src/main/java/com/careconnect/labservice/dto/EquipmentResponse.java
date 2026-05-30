package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private Long id;
    private String name;
    private String type;
    private String serialNumber;
    private EquipmentStatus status;
    private LocalDate lastCalibrated;
    private LocalDate nextCalibration;
    private String notes;
}
