package com.careconnect.billingservice.service;

import com.careconnect.billingservice.client.PatientServiceClient;
import com.careconnect.billingservice.dto.*;
import com.careconnect.billingservice.entity.Invoice;
import com.careconnect.billingservice.entity.InvoiceItem;
import com.careconnect.billingservice.enums.InvoiceStatus;
import com.careconnect.billingservice.exception.BadRequestException;
import com.careconnect.billingservice.exception.ResourceNotFoundException;
import com.careconnect.billingservice.repository.InvoiceItemRepository;
import com.careconnect.billingservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PatientServiceClient patientServiceClient;

    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        log.info("Manual creation of invoice for patient ID: {}", request.getPatientId());

        try {
            PatientSummaryResponse patient = patientServiceClient.getPatientSummary(request.getPatientId());
            if (patient == null) throw new BadRequestException("Patient not found");
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify patient: " + e.getMessage());
        }

        Invoice invoice = Invoice.builder()
                .patientId(request.getPatientId())
                .consultationId(request.getConsultationId())
                .admissionId(request.getAdmissionId())
                .surgeryId(request.getSurgeryId())
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .status(InvoiceStatus.PENDING)
                .build();

        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse createInvoiceFromEvent(Long consultationId, Long patientId, BigDecimal consultationFee, String diagnosis) {
        log.info("Auto-creating or updating invoice for consultation ID: {}", consultationId);

        Invoice invoice = invoiceRepository.findByConsultationId(consultationId)
                .orElseGet(() -> {
                    Invoice newInvoice = Invoice.builder()
                            .patientId(patientId)
                            .consultationId(consultationId)
                            .notes("Auto-generated for diagnosis: " + diagnosis)
                            .status(InvoiceStatus.PENDING)
                            .build();
                    return invoiceRepository.save(newInvoice);
                });

        // Check if consultation fee already added to avoid duplicates if event is processed twice
        boolean feeAlreadyExists = invoice.getItems().stream()
                .anyMatch(item -> "Consultation Fee".equals(item.getDescription()));

        if (!feeAlreadyExists) {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description("Consultation Fee")
                    .quantity(1)
                    .unitPrice(consultationFee)
                    .build();

            invoiceItemRepository.save(item);
            invoice.getItems().add(item);
            
            recalculateTotalAmount(invoice);
            invoice = invoiceRepository.save(invoice);
        }

        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse addRoomChargesToInvoice(Long admissionId, Long patientId, Long nights, BigDecimal pricePerNight) {
        log.info("Adding room charges for admission ID: {}", admissionId);

        Invoice invoice = invoiceRepository.findByAdmissionId(admissionId)
                .orElseGet(() -> {
                    Invoice newInvoice = Invoice.builder()
                            .patientId(patientId)
                            .admissionId(admissionId)
                            .notes("Auto-generated for admission")
                            .status(InvoiceStatus.PENDING)
                            .build();
                    return invoiceRepository.save(newInvoice);
                });

        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .description("Room Charges - " + nights + " night(s)")
                .quantity(nights.intValue())
                .unitPrice(pricePerNight)
                .build();

        invoiceItemRepository.save(item);
        invoice.getItems().add(item);

        recalculateTotalAmount(invoice);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse addItemToInvoice(Long invoiceId, InvoiceItemCreateRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot add items to an invoice with status: " + invoice.getStatus());
        }

        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .build();

        invoiceItemRepository.save(item);
        invoice.getItems().add(item);

        recalculateTotalAmount(invoice);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse removeItemFromInvoice(Long invoiceId, Long itemId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot remove items from an invoice with status: " + invoice.getStatus());
        }

        InvoiceItem itemToRemove = invoice.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Invoice item not found with ID: " + itemId));

        invoice.getItems().remove(itemToRemove);
        invoiceItemRepository.delete(itemToRemove);

        recalculateTotalAmount(invoice);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        invoice.setStatus(status);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    private void recalculateTotalAmount(Invoice invoice) {
        BigDecimal total = invoice.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setTotalAmount(total);
        
        // Auto-update status if total amount changes while fully paid previously
        if (invoice.getPaidAmount().compareTo(total) >= 0 && total.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else if (invoice.getStatus() != InvoiceStatus.CANCELLED) {
            invoice.setStatus(InvoiceStatus.PENDING);
        }
    }

    private InvoiceResponse mapToResponse(Invoice entity) {
        String patientName = "Unknown";
        try {
            PatientSummaryResponse patient = patientServiceClient.getPatientSummary(entity.getPatientId());
            if (patient != null) {
                patientName = patient.getFirstName() + " " + patient.getLastName();
            }
        } catch (Exception e) {
            log.warn("Could not fetch patient details for patientId: {}", entity.getPatientId());
        }

        List<InvoiceItemResponse> itemResponses = entity.getItems().stream()
                .map(item -> InvoiceItemResponse.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .patientName(patientName)
                .consultationId(entity.getConsultationId())
                .admissionId(entity.getAdmissionId())
                .surgeryId(entity.getSurgeryId())
                .issuedAt(entity.getIssuedAt())
                .dueDate(entity.getDueDate())
                .totalAmount(entity.getTotalAmount())
                .paidAmount(entity.getPaidAmount())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .items(itemResponses)
                .build();
    }
}
