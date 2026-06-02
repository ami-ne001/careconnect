package com.careconnect.auth.messaging;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "careconnect-exchange";
    public static final String ROUTING_KEY_DOCTOR_USER_CREATED = "doctor.user.created";

    @Bean
    public TopicExchange careConnectExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
