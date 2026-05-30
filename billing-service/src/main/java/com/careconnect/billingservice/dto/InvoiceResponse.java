package com.careconnect.billingservice.dto;

import com.careconnect.billingservice.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long consultationId;
    private Long admissionId;
    private Long surgeryId;
    private LocalDateTime issuedAt;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private InvoiceStatus status;
    private String notes;
    private List<InvoiceItemResponse> items;
}
