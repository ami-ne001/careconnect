package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.DocumentType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalDocumentResponse {
    private Long id;
    private Long patientId;
    private Long uploadedBy;
    private DocumentType documentType;
    private String fileName;
    private String filePath;
    private String description;
    private LocalDateTime uploadedAt;
}
