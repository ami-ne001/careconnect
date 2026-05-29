package com.careconnect.patientservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPatientAdmitted(PatientAdmittedEvent event) {
        log.info("Publishing PatientAdmittedEvent: {}", event);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_PATIENT_ADMITTED,
                event
        );
    }

    public void publishPatientDischarged(PatientDischargedEvent event) {
        log.info("Publishing PatientDischargedEvent: {}", event);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_PATIENT_DISCHARGED,
                event
        );
    }
}
