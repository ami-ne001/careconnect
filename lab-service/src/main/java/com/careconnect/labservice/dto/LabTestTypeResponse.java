package com.careconnect.labservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTestTypeResponse {
    private Long id;
    private String name;
    private String category;
    private String sampleType;
    private String description;
}
