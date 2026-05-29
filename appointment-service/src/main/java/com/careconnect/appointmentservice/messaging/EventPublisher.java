package com.careconnect.appointmentservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishAppointmentConfirmed(AppointmentConfirmedEvent event) {
        log.info("Publishing AppointmentConfirmedEvent for appointmentId={}, patientId={}",
                event.getAppointmentId(), event.getPatientId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_APPOINTMENT_CONFIRMED,
                event
        );
    }
}
