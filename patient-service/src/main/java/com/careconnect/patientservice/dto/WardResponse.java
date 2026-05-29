package com.careconnect.patientservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardResponse {
    private Long id;
    private String name;
    private String description;
    private Integer floor;
    private LocalDateTime createdAt;
}
