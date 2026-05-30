package com.careconnect.billingservice.dto;

import com.careconnect.billingservice.enums.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private InvoiceStatus status;
}
