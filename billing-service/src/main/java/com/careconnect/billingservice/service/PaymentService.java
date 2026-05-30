package com.careconnect.billingservice.service;

import com.careconnect.billingservice.dto.PaymentCreateRequest;
import com.careconnect.billingservice.dto.PaymentResponse;
import com.careconnect.billingservice.entity.Invoice;
import com.careconnect.billingservice.entity.Payment;
import com.careconnect.billingservice.enums.InvoiceStatus;
import com.careconnect.billingservice.exception.BadRequestException;
import com.careconnect.billingservice.exception.ResourceNotFoundException;
import com.careconnect.billingservice.repository.InvoiceRepository;
import com.careconnect.billingservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public PaymentResponse recordPayment(PaymentCreateRequest request, Long receivedBy) {
        log.info("Recording payment for invoice ID: {}", request.getInvoiceId());

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + request.getInvoiceId()));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot record payment for a CANCELLED invoice.");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Invoice is already fully PAID.");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }

        BigDecimal remainingBalance = invoice.getTotalAmount().subtract(invoice.getPaidAmount());
        if (request.getAmount().compareTo(remainingBalance) > 0) {
            throw new BadRequestException("Payment amount (" + request.getAmount() + ") exceeds remaining balance (" + remainingBalance + ").");
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .receivedBy(receivedBy)
                .amount(request.getAmount())
                .method(request.getMethod())
                .reference(request.getReference())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice paid amount
        invoice.setPaidAmount(invoice.getPaidAmount().add(request.getAmount()));

        // Update invoice status
        if (invoice.getPaidAmount().compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        invoiceRepository.save(invoice);

        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoice_Id(invoiceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment entity) {
        return PaymentResponse.builder()
                .id(entity.getId())
                .invoiceId(entity.getInvoice().getId())
                .receivedBy(entity.getReceivedBy())
                .amount(entity.getAmount())
                .method(entity.getMethod())
                .paidAt(entity.getPaidAt())
                .reference(entity.getReference())
                .build();
    }
}
