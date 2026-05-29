package com.careconnect.patientservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardCreateRequest {

    @NotBlank(message = "Ward name is required")
    private String name;

    private String description;
    private Integer floor;
}
