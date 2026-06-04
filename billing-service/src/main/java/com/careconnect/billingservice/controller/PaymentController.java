package com.careconnect.billingservice.controller;

import com.careconnect.billingservice.dto.PaymentCreateRequest;
import com.careconnect.billingservice.dto.PaymentResponse;
import com.careconnect.billingservice.service.PaymentService;
import com.careconnect.billingservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'PATIENT')")
    public ResponseEntity<PaymentResponse> recordPayment(
            @Valid @RequestBody PaymentCreateRequest request,
            HttpServletRequest httpRequest) {
        
        String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
        Long receivedBy = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            String userIdStr = jwtUtil.extractUserId(jwt);
            if (userIdStr != null) {
                receivedBy = Long.parseLong(userIdStr);
            }
        }
        
        return ResponseEntity.ok(paymentService.recordPayment(request, receivedBy));
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsForInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
}
