package com.careconnect.billingservice.repository;

import com.careconnect.billingservice.entity.Invoice;
import com.careconnect.billingservice.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(Long patientId);
    Optional<Invoice> findByConsultationId(Long consultationId);
    Optional<Invoice> findByAdmissionId(Long admissionId);
    Optional<Invoice> findBySurgeryId(Long surgeryId);
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findByPatientIdAndStatus(Long patientId, InvoiceStatus status);
}
