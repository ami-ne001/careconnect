package com.careconnect.billingservice.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "careconnect-exchange";

    public static final String CONSULTATION_CLOSED_QUEUE = "billing-consultation-closed-queue";
    public static final String PATIENT_DISCHARGED_QUEUE = "billing-patient-discharged-queue";

    public static final String ROUTING_KEY_CONSULTATION_CLOSED = "consultation.closed";
    public static final String ROUTING_KEY_PATIENT_DISCHARGED = "patient.discharged";

    @Bean
    public TopicExchange careConnectExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue consultationClosedQueue() {
        return new Queue(CONSULTATION_CLOSED_QUEUE, true);
    }

    @Bean
    public Queue patientDischargedQueue() {
        return new Queue(PATIENT_DISCHARGED_QUEUE, true);
    }

    @Bean
    public Binding bindingConsultationClosed(Queue consultationClosedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(consultationClosedQueue)
                .to(careConnectExchange)
                .with(ROUTING_KEY_CONSULTATION_CLOSED);
    }

    @Bean
    public Binding bindingPatientDischarged(Queue patientDischargedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(patientDischargedQueue)
                .to(careConnectExchange)
                .with(ROUTING_KEY_PATIENT_DISCHARGED);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
