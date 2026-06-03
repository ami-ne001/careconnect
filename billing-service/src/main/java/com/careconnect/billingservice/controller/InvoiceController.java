package com.careconnect.billingservice.controller;

import com.careconnect.billingservice.dto.InvoiceCreateRequest;
import com.careconnect.billingservice.dto.InvoiceItemCreateRequest;
import com.careconnect.billingservice.dto.InvoiceResponse;
import com.careconnect.billingservice.dto.InvoiceStatusUpdateRequest;
import com.careconnect.billingservice.enums.InvoiceStatus;
import com.careconnect.billingservice.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(patientId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(@PathVariable InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> addItemToInvoice(@PathVariable Long id, @Valid @RequestBody InvoiceItemCreateRequest request) {
        return ResponseEntity.ok(invoiceService.addItemToInvoice(id, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> removeItemFromInvoice(@PathVariable Long id, @PathVariable Long itemId) {
        return ResponseEntity.ok(invoiceService.removeItemFromInvoice(id, itemId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(@PathVariable Long id, @Valid @RequestBody InvoiceStatusUpdateRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, request.getStatus()));
    }
}
