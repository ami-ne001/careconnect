package com.careconnect.billingservice.messaging;

import com.careconnect.billingservice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventListener {

    private final InvoiceService invoiceService;

    @RabbitListener(queues = RabbitMQConfig.CONSULTATION_CLOSED_QUEUE)
    public void handleConsultationClosed(ConsultationClosedEvent event) {
        log.info("Received ConsultationClosedEvent for consultation ID: {}", event.getConsultationId());
        
        try {
            BigDecimal fee = event.getConsultationFee() != null ? event.getConsultationFee() : new BigDecimal("100.00");
            invoiceService.createInvoiceFromEvent(
                    event.getConsultationId(),
                    event.getPatientId(),
                    fee,
                    event.getDiagnosis()
            );
        } catch (Exception e) {
            log.error("Error processing ConsultationClosedEvent: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.PATIENT_DISCHARGED_QUEUE)
    public void handlePatientDischarged(PatientDischargedEvent event) {
        log.info("Received PatientDischargedEvent for admission ID: {}", event.getAdmissionId());
        
        try {
            Long nights = event.getNights() != null && event.getNights() > 0 ? event.getNights() : 1L;
            BigDecimal price = event.getPricePerNight() != null ? event.getPricePerNight() : new BigDecimal("150.00");
            
            invoiceService.addRoomChargesToInvoice(
                    event.getAdmissionId(),
                    event.getPatientId(),
                    nights,
                    price
            );
        } catch (Exception e) {
            log.error("Error processing PatientDischargedEvent: {}", e.getMessage(), e);
        }
    }
}
