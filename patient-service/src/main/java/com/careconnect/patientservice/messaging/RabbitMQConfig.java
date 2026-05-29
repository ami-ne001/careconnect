package com.careconnect.patientservice.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "careconnect-exchange";

    public static final String APPOINTMENT_CONFIRMED_QUEUE = "patient-appointment-confirmed-queue";
    public static final String SURGERY_SCHEDULED_QUEUE = "patient-surgery-scheduled-queue";
    public static final String LAB_RESULT_UPLOADED_QUEUE = "patient-lab-result-uploaded-queue";

    public static final String ROUTING_KEY_PATIENT_ADMITTED = "patient.admitted";
    public static final String ROUTING_KEY_PATIENT_DISCHARGED = "patient.discharged";
    
    public static final String ROUTING_KEY_APPOINTMENT_CONFIRMED = "appointment.confirmed";
    public static final String ROUTING_KEY_SURGERY_SCHEDULED = "surgery.scheduled";
    public static final String ROUTING_KEY_LAB_RESULT_UPLOADED = "lab.result.uploaded";

    @Bean
    public TopicExchange careConnectExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue appointmentConfirmedQueue() {
        return new Queue(APPOINTMENT_CONFIRMED_QUEUE, true);
    }

    @Bean
    public Queue surgeryScheduledQueue() {
        return new Queue(SURGERY_SCHEDULED_QUEUE, true);
    }

    @Bean
    public Queue labResultUploadedQueue() {
        return new Queue(LAB_RESULT_UPLOADED_QUEUE, true);
    }

    @Bean
    public Binding bindingAppointmentConfirmed(Queue appointmentConfirmedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(appointmentConfirmedQueue).to(careConnectExchange).with(ROUTING_KEY_APPOINTMENT_CONFIRMED);
    }

    @Bean
    public Binding bindingSurgeryScheduled(Queue surgeryScheduledQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(surgeryScheduledQueue).to(careConnectExchange).with(ROUTING_KEY_SURGERY_SCHEDULED);
    }

    @Bean
    public Binding bindingLabResultUploaded(Queue labResultUploadedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(labResultUploadedQueue).to(careConnectExchange).with(ROUTING_KEY_LAB_RESULT_UPLOADED);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
