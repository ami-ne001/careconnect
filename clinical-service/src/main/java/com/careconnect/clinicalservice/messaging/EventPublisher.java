package com.careconnect.clinicalservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishConsultationClosed(ConsultationClosedEvent event) {
        log.info("Publishing ConsultationClosedEvent: {}", event);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_CONSULTATION_CLOSED,
                event
        );
    }

    public void publishSurgeryScheduled(SurgeryScheduledEvent event) {
        log.info("Publishing SurgeryScheduledEvent: {}", event);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_SURGERY_SCHEDULED,
                event
        );
    }
}
