package com.careconnect.billingservice.dto;

import com.careconnect.billingservice.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private Long receivedBy;
    private BigDecimal amount;
    private PaymentMethod method;
    private LocalDateTime paidAt;
    private String reference;
}
