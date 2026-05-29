package com.careconnect.appointmentservice.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Must match patient-service RabbitMQConfig exactly
    public static final String EXCHANGE_NAME = "careconnect-exchange";

    public static final String APPOINTMENT_CONFIRMED_QUEUE = "patient-appointment-confirmed-queue";

    public static final String ROUTING_KEY_APPOINTMENT_CONFIRMED = "appointment.confirmed";

    @Bean
    public TopicExchange careConnectExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue appointmentConfirmedQueue() {
        return new Queue(APPOINTMENT_CONFIRMED_QUEUE, true);
    }

    @Bean
    public Binding bindingAppointmentConfirmed(Queue appointmentConfirmedQueue,
                                               TopicExchange careConnectExchange) {
        return BindingBuilder
                .bind(appointmentConfirmedQueue)
                .to(careConnectExchange)
                .with(ROUTING_KEY_APPOINTMENT_CONFIRMED);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
