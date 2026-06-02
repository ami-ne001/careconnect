package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditActivityResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String role;
    private String action;
    private String module;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;
}
