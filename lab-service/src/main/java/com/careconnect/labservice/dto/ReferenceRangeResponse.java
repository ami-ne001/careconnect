package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferenceRangeResponse {
    private Long id;
    private Long testTypeId;
    private String component;
    private String unit;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private Gender gender;
    private String notes;
}
