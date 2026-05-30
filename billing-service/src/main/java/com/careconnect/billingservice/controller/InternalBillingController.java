package com.careconnect.billingservice.controller;

import com.careconnect.billingservice.dto.InvoiceResponse;
import com.careconnect.billingservice.entity.Invoice;
import com.careconnect.billingservice.exception.ResourceNotFoundException;
import com.careconnect.billingservice.repository.InvoiceRepository;
import com.careconnect.billingservice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal/billing")
@RequiredArgsConstructor
public class InternalBillingController {

    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;

    @GetMapping("/invoices/consultation/{consultationId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByConsultationId(@PathVariable Long consultationId) {
        Invoice invoice = invoiceRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for consultation ID: " + consultationId));
        return ResponseEntity.ok(invoiceService.getInvoiceById(invoice.getId()));
    }

    @GetMapping("/invoices/patient/{patientId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(patientId));
    }
}
