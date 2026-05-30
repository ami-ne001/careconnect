package com.careconnect.labservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTestTypeCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String category;
    private String sampleType;
    private String description;
}
